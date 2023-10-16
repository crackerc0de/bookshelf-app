const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_CODING_MULU";

bookIsRead.addEventListener("change", function () {
  const bookSubmit = document.querySelector("#bookSubmit>span");
  if (bookIsRead.checked) {
    bookSubmit.innerText = "Finished";
  } else {
    bookSubmit.innerText = "Ongoing";
  }
});

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Local storage unavailable in your browser");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function localDataStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement("h5");
  textTitle.classList.add("card-title");
  textTitle.innerText = title;

  const textAuthor = document.createElement("h6");
  textAuthor.classList.add("card-subtitle");
  textAuthor.innerText = `Author: ${author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Year: ${year}`;

  const textCard = document.createElement("div");
  textCard.classList.add("inner");
  textCard.append(textTitle, textAuthor, textYear);

  const cardBody = document.createElement("div");
  cardBody.classList.add("card");
  cardBody.append(textCard);
  cardBody.setAttribute("id", `book-${id}`);

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.addEventListener("click", function () {
    deleteBookFromCompleted(bookObject.id);
  });

  if (isComplete) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    cardBody.append(undoButton, deleteButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      addBookToCompleted(
        bookObject.id,
        bookObject.title,
        bookObject.author,
        bookObject.year
      );
    });

    cardBody.append(checkButton, deleteButton);
  }

  return cardBody;
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  Swal.fire({
    position: "center",
    icon: "success",
    title: `${bookTarget.title} hasn't been Read`,
    showConfirmButton: false,
    timer: 1500,
  });
}

function deleteBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;

  Swal.fire({
    title: "Are you sure want to delete",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      Swal.fire("Deleted!", "Your file has been deleted.", "success");
    }
  });
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  Swal.fire({
    position: "center",
    icon: "success",
    title: `${bookTarget.title} has been Read`,
    showConfirmButton: false,
    timer: 1500,
  });
}

function addBook() {
  const textTitle = document.getElementById("inputTitle").value;
  const textAuthor = document.getElementById("inputAuthor").value;
  const textYear = document.getElementById("inputYear").value;
  const checkRead = document.getElementById("bookIsRead").checked;

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    textTitle,
    textAuthor,
    parseInt(textYear),
    checkRead
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  document.getElementById("formInputBook").reset();
  document.getElementById("characterLeft").innerText = "50";

  Swal.fire({
    position: "center",
    icon: "success",
    title: `${textTitle} added successfully`,
    showConfirmButton: false,
    timer: 1500,
  });
}

const searchBookOngoing = document.getElementById("searchBookOngoing");

searchBookOngoing.addEventListener("keyup", function (e) {
  const searchBookOngoing = e.target.value.toLowerCase();
  const books = document.querySelectorAll(".card");

  books.forEach((book) => {
    const bookSubtitle = book.childNodes[0];
    const bookTitle = bookSubtitle.firstChild.textContent.toLowerCase();

    if (bookTitle.indexOf(searchBookOngoing) != -1) {
      book.setAttribute("style", "display: flex");
    } else {
      book.setAttribute("style", "display: none !important");
    }
  });
});

const searchBookFinished = document.getElementById("searchBookFinished");

searchBookFinished.addEventListener("keyup", function (e) {
  const searchBookFinished = e.target.value.toLowerCase();
  const books = document.querySelectorAll(".card");

  books.forEach((book) => {
    const bookSubtitle = book.childNodes[0];
    const bookTitle = bookSubtitle.firstChild.textContent.toLowerCase();

    if (bookTitle.indexOf(searchBookFinished) != -1) {
      book.setAttribute("style", "display: flex");
    } else {
      book.setAttribute("style", "display: none !important");
    }
  });
});

document.addEventListener(SAVED_EVENT, () =>
  console.log(localStorage.getItem(STORAGE_KEY))
);

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBOOKList = document.getElementById("incompleteBookshelfList");
  const completeBOOKList = document.getElementById("completedBookshelfList");

  incompleteBOOKList.innerHTML = "";
  completeBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completeBOOKList.append(bookElement);
    } else {
      incompleteBOOKList.append(bookElement);
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("formInputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    localDataStorage();
  }

  const inputMaxLengthOnLoad = document.getElementById("inputTitle").maxLength;
  document.getElementById("characterLeft").innerText = inputMaxLengthOnLoad;

  document.getElementById("inputTitle").addEventListener("input", function () {
    const totalCharacterUsed =
      document.getElementById("inputTitle").value.length;
    const totalCharacterMaximum =
      document.getElementById("inputTitle").maxLength;

    console.log("Total Character Used: ", totalCharacterUsed);
    console.log("Total Character Maximum: ", totalCharacterMaximum);

    const totalCharacterLeft = totalCharacterMaximum - totalCharacterUsed;
    document.getElementById("characterLeft").innerText =
      totalCharacterLeft.toString();

    if (totalCharacterLeft === 0) {
      document.getElementById("characterLeft").innerText = "Maximum Character!";
    } else if (totalCharacterLeft <= 5) {
      document.getElementById("notificationCharacterLeft").style.color = "red";
    } else {
      document.getElementById("notificationCharacterLeft").style.color =
        "black";
    }
  });
});
