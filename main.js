const filterInputElm = document.querySelector("#filter");
const nameInputElm = document.querySelector(".nameInput");
const priceInputElm = document.querySelector(".priceInput");
const msgElm = document.querySelector(".msg");
const collectionElm = document.querySelector(".collection");
const form = document.querySelector("form");
const submitBtn = document.querySelector(".submit-btn button");

// Input function
function receiveInput() {
  const name = nameInputElm.value;
  const price = priceInputElm.value;
  return { name, price };
}

// Clear msg function
function clearMsg() {
  msgElm.textContent = "";
}

// Showing msg for invalid value
function showingMsg(msg, action = "success") {
  const textMsg = `<div class="alert alert-${action}" role="alert">
     ${msg}
    </div>`;
  msgElm.insertAdjacentHTML("afterbegin", textMsg);
  setTimeout(() => {
    clearMsg();
  }, 1000);
}

// Checking valid inputs' value
function validateInput(name, price) {
  let isValid = true;

  if (name === "" || price === "") {
    isValid = false;
    showingMsg("Please enter valid information", "danger");
    return isValid;
  }

  if (isNaN(price) || Number(price) <= 0) {
    isValid = false;
    showingMsg("Please enter a valid price", "danger");
    return isValid;
  }

  showingMsg("Product successfully added", "success");
  return isValid;
}

// Reset the input values
function resetInput() {
  nameInputElm.value = "";
  priceInputElm.value = "";
}

// Add product to data store
function addProduct(name, price) {
  const product = {
    id: products.length + 1,
    name,
    price,
  };

  products.push(product);
  return product;
}

// Show product to UI
function showProduct(productInfo) {
  //removing the no product massage after adding product
  const notFoundMsg = document.querySelector(".not-found-product");
  if (notFoundMsg) {
    notFoundMsg.remove();
  }

  const { id, name, price } = productInfo;
  const elm = `<li
            class="list-group-item collection-item d-flex flex-row justify-content-between"
            data-productid="${id}"
          >
            <div class="product-info">
              <strong>${name}</strong> - <span class="price">$${price}</span>
            </div>
            <div class="action-btn">
              <i class="fa fa-pencil-alt edit-product float-right me-2"></i>
              <i class="fa fa-trash-alt delete-product float-right"></i>
            </div>
          </li>`;

  collectionElm.insertAdjacentHTML("afterbegin", elm);
}

// Add product to localStorage
function addProductToStorage(product) {
  let products;
  if (localStorage.getItem("storeProducts")) {
    products = JSON.parse(localStorage.getItem("storeProducts"));
    //update and add the new Product
    products.push(product);
  } else {
    products = [];
    products.push(product);
  }
  localStorage.setItem("storeProducts", JSON.stringify(products));
}

// update the product after edit
function updateProduct(receivedProduct, storageProducts = products) {
  const updatedProducts = storageProducts.map((product) => {
    if (product.id === receivedProduct.id) {
      return {
        ...product,
        name: receivedProduct.name,
        price: receivedProduct.price,
      };
    } else {
      return product;
    }
  });
  return updatedProducts;
}

// after clicking update btn
function clearEditForm() {
  submitBtn.classList.remove("update-btn");
  submitBtn.classList.remove("btn-secondary");
  submitBtn.textContent = "Submit";
  submitBtn.removeAttribute("[data-id]");
}

//product
let products = localStorage.getItem("storeProducts")
  ? JSON.parse(localStorage.getItem("storeProducts"))
  : [];

// update localStorage after edit
function updateProductToStorage(product) {
  //This is shortcut means I am updating this from my product(memory store)
  // localStorage.setItem("storeProducts", JSON.stringify(products));

  //If I want, I can do it manually
  //--> At first, I have to find the existing product from localStorage
  let products;
  products = JSON.parse(localStorage.getItem("storeProducts"));
  //--> then update it with new product update
  products = updateProduct(product, products);
  //--> last, save it to localStorage
  localStorage.setItem("storeProducts", JSON.stringify(products));
}

// Handle form submission
function handleFormSubmission(e) {
  e.preventDefault();

  // Receiving the input
  const { name, price } = receiveInput();

  // Reset input after submit
  resetInput();

  // Checking valid inputs' value
  const isValid = validateInput(name, price);
  if (!isValid) return;

  if (submitBtn.classList.contains("update-product")) {
    //user wan to update the product
    const id = Number(submitBtn.dataset.id);
    //update data to memory store
    const product = {
      id,
      name,
      price,
    };
    const updatedProducts = updateProduct(product);

    //memory store update
    products = updatedProducts;

    //DOM update
    showProductsToUI(products);

    // update in localStorage
    updateProductToStorage(product);

    //clearEditForm
    clearEditForm();
  } else {
    // Add product
    const product = addProduct(name, price);

    // Show product to UI
    showProduct(product);

    // Add product to localStorage
    addProductToStorage(product);
  }
}

// Get product ID to update or delete product
function getProductID(e) {
  const liElm = e.target.closest("li"); // Use closest to get the nearest <li> element
  const id = Number(liElm.getAttribute("data-productid"));
  return id;
}

// Remove product from data store
function removeProduct(id) {
  const productIndex = products.findIndex((product) => product.id === id);
  if (productIndex > -1) {
    products.splice(productIndex, 1);
  }
}

// Remove product from UI
function removeProductFromUI(id) {
  const productElm = document.querySelector(`[data-productid="${id}"]`);
  if (productElm) {
    productElm.remove();
    showingMsg("Product removed successfully", "warning");
  }
}

// remove product from localStorage
function removeProductFromLocalStorage(id) {
  let products;
  products = JSON.parse(localStorage.getItem("storeProducts"));
  products = products.filter((product) => product.id !== id);
  localStorage.setItem("storeProducts", JSON.stringify(products));
}
// find Product To Edit
function findProductToEdit(id) {
  const foundProduct = products.find((product) => product.id === id);
  return foundProduct;
}

//populating existing form in edit state
function populateEditForm(foundProduct) {
  nameInputElm.value = foundProduct.name;
  priceInputElm.value = foundProduct.price;

  // change the button to submit after edit
  submitBtn.textContent = "Update";
  submitBtn.classList.add("btn-secondary");
  submitBtn.classList.add("update-product");
  submitBtn.setAttribute("data-id", foundProduct.id);
}

// Handle product manipulation (delete, edit)
function handleManupulateProduct(e) {
  // Get the product ID to remove and edit the product
  const id = getProductID(e);

  if (e.target.classList.contains("delete-product")) {
    // Remove product from data store
    removeProduct(id);
    // Remove product from UI
    removeProductFromUI(id);
    // remove product from localStorage
    removeProductFromLocalStorage(id);
  } else if (e.target.classList.contains("edit-product")) {
    const foundProduct = findProductToEdit(id);

    //give the name and price in input
    populateEditForm(foundProduct);
  }
}

//sHow product from localStorage to UI
function showProductsToUI(products) {
  // Clear the current list of products
  collectionElm.innerHTML = "";

  let liElms;

  liElms =
    products.length === 0
      ? '<li class="list-group-item collection-item not-found-product">No Products to Show</li>'
      : "";

  products.sort((a, b) => b.id - a.id);

  products.forEach((product) => {
    const { id, name, price } = product;
    liElms += `<li
            class="list-group-item collection-item d-flex flex-row justify-content-between"
            data-productid="${id}"
          >
            <div class="product-info">
              <strong>${name}</strong> - <span class="price">$${price}</span>
            </div>
            <div class="action-btn">
              <i class="fa fa-pencil-alt edit-product me-2"></i>
              <i class="fa fa-trash-alt delete-product"></i>
            </div>
          </li>`;
  });

  collectionElm.insertAdjacentHTML("afterbegin", liElms);
}

// Form submit event
form.addEventListener("submit", handleFormSubmission);

// Product manipulation event (delete)
collectionElm.addEventListener("click", handleManupulateProduct);

document.addEventListener("DOMContentLoaded", () => showProductsToUI(products));
