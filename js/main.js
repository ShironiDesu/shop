document.addEventListener("DOMContentLoaded", async () => {
  const signInBlock = document.querySelector(".signin-block");
  const signUpBlock = document.querySelector(".signup-block");
  const toggleSignInBtn = signInBlock.querySelector(".toggle-form");
  const toggleSignUpBtn = signUpBlock.querySelector(".toggle-form");
  const signUpForm = document.querySelector(".signup-form");
  const signInForm = document.querySelector(".signin-form");
  const authorization = document.querySelector(".authorization");
  const productsSection = document.querySelector(".products-section");
  const productsList = document.querySelector(".products-list");
  const productsContainer = document.querySelector(".products-container");
  const sidebar = document.querySelector(".sidebar");
  const products = document.querySelector(".products");
  const subSide = document.querySelector(".subside");
  const side = document.querySelector(".side");
  const paginationContainer = document.querySelector(".pagination-container");
  const searchInput = document.querySelector(".search-input");
  const searchForm = document.querySelector("#searchForm");
  const cartBtn = document.querySelector(".cart-btn");
  const shoppingCart = document.querySelector(".shopping-cart");
  const cartSection = document.querySelector(".cart-section");
  const serverURL = "http://192.168.1.4:9999";
  const logoutBtn = document.querySelector(".logout-btn");
  const totalSpan = document.querySelector(".total");
  const header = document.querySelector(".header");
  const sidebarSection = document.querySelector(".aside-section");
  const pageLimit = 5;
  let currentPage = 1;
  let cart = {
    data: [],
    total: 0,
  };
  const saveCartToLocalStorage = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };
  const toggleElems = (...elems) => {
    elems.forEach((item) => item.classList.toggle("hide"));
  };

  const userRegister = async (e) => {
    e.preventDefault();
    const emailInput = signUpForm.querySelector('[name="email"]');
    const usernameInput = signUpForm.querySelector('[name="username"]');
    const passwordInput = signUpForm.querySelector('[name="password"]');

    const headers = {
      accept: "application/json",
      "Content-Type": "application/json",
    };
    const sendData = {
      email: emailInput.value,
      password: usernameInput.value,
      username: passwordInput.value,
    };
    const res = await fetch(`${serverURL}/auth/register`, {
      method: "POST",
      body: JSON.stringify(sendData),
      headers: headers,
    });
    if (res.ok) {
      const data = await res.json();
      console.log(data);
      toggleElems(signInBlock, signUpBlock);
    }
  };
  const userLogin = async (e) => {
    e.preventDefault();
    const emailInput = signInForm.querySelector('[name="email"]');
    const passwordInput = signInForm.querySelector('[name="password"]');
    const headers = {
      accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    };
    const sendData = {
      username: emailInput.value,
      password: passwordInput.value,
    };
    const res = await fetch(`${serverURL}/auth/login`, {
      method: "POST",
      headers: headers,
      body: new URLSearchParams(sendData),
    });
    if (res.ok) {
      const data = await res.json();
      console.log(data);
      const token = data.access_token;
      localStorage.setItem("token", token);
      await authMe();
    }
  };
  const authMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    const headers = {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
    const res = await fetch(`${serverURL}/auth/me`, {
      method: "GET",
      headers: headers,
    });
    if (res.ok) {
      const data = await res.json();
      console.log(data);
      toggleElems(productsSection, authorization, header, sidebarSection);
    }
    if (res.status === 401) {
      localStorage.removeItem("token");
    }
  };
  const insertCategoryName = async (data) => {
    for (let i = 0; i < data.length; i++) {
      const divs = `
                <div class='categories' data-id='${data[i].id}'>${data[i].name}</div>
            `;
      side.insertAdjacentHTML("beforeend", divs);
    }
  };
  const showCategory = async (e) => {
    const headers = {
      accept: "application/json",
    };
    const res = await fetch(`${serverURL}/products/category`, {
      method: "GET",
      headers: headers,
    });
    if (res.ok) {
      const data = await res.json();
      console.log(data);
      await insertCategoryName(data.categories);
      await getSubCategoriesData(data.categories);
    }
  };
  const getSubCategoriesData = async () => {
    side.addEventListener("click", async (e) => {
      toggleElems(subSide);
      const headers = {
        accept: "application/json",
      };
      const id = e.target.dataset.id;
      const res = await fetch(`${serverURL}/products/category/${id}`, {
        method: "GET",
        headers: headers,
      });
      const data = await res.json();
      if (id) {
        await insertSubCategoryName(data.subcategories);
      }
    });
  };

  const insertSubCategoryName = async (data) => {
    subSide.innerHTML = " ";
    for (let i = 0; i < data.length; i++) {
      const subDivs = `
                <div class='sub-categories'>${data[i].name}</div>
            `;

      subSide.insertAdjacentHTML("beforeend", subDivs);
    }
  };

  const getProducts = async (e) => {
    const target = e.target.closest(".sub-categories").textContent;

    if (target) {
      const headers = {
        accept: "application/json",
      };

      const res = await fetch(
        `${serverURL}/products/?category_name=${target}`,
        {
          method: "GET",
          headers: headers,
        }
      );

      if (res.ok) {
        const data = await res.json();
        console.log(data.products);
        createPagination(data.products, target);
        insertProductsCard(data.products);
      }
    }
  };

  const insertProductsCard = async (data) => {
    products.innerHTML = " ";
    for (let i = 0; i < pageLimit; i++) {
      const card = `
                <div class="card" >
                    <div class="prod-id hide">${data[i].category_id}</div>
                    <h2 class="name">Название: ${data[i].name}</h2>
                    <p class="count">Количество: ${data[i].count}</p>
                    <p class="price">Цена: $${data[i].price}</p>
                    <button class="buy-btn">Buy</button>
                    <p class="description">${data[i].description}</p>
                </div>
            `;
      products.insertAdjacentHTML("beforeend", card);
    }
  };

  const createPagination = async (data, categoryName) => {
    paginationContainer.innerHTML = "";
    paginationContainer.dataset.categoryName = categoryName;
    const productsLength = data.length;
    console.log(productsLength);
    const buttonsCount = Math.floor(productsLength / pageLimit) + 1;

    for (let i = 1; i <= buttonsCount; i++) {
      const button = document.createElement("button");
      button.textContent = i;
      paginationContainer.append(button);
    }
  };

  const openProductsPage = async (e) => {
    const paginationButton = e.target.closest("button");

    if (paginationButton) {
      const categoryName = paginationContainer.dataset.categoryName;

      currentPage = +paginationButton.textContent;
      let skip = pageLimit * (currentPage - 1);

      const res = await fetch(
        `${serverURL}/products/?category_name=${categoryName}&skip=${skip}&limit=${pageLimit}`
      );

      const data = await res.json();
      console.log(data);
      insertProductsCard(data.products);
    }
  };
  const searchProduct = async (e) => {
    const searchInputValue = searchInput.value;
    const headers = {
      accept: "application/json",
    };
    const res = await fetch(
      `${serverURL}/products/search?keyword=${searchInputValue}`,
      {
        method: "GET",
        headers: headers,
      }
    );
    if (res.ok) {
      const data = await res.json();
      console.log(data);
      insertSearchedProducts(data.products);
    }
  };
  const insertSearchedProducts = async (data) => {
    products.innerHTML = " ";
    paginationContainer.innerHTML = "";
    for (let i = 0; i < data.length; i++) {
      const card = `
                <div class="card">
                    <div class="prod-id hide">${data[i].category_id}</div>
                    <h2 class="name">Название: ${data[i].name}</h2>
                    <p class="count">Количество: ${data[i].count}</p>
                    <p class="price">Цена: $${data[i].price}</p>
                    <button class="buy-btn">Buy</button>
                    <p class="description">${data[i].description}</p>
                </div>
            `;
      products.insertAdjacentHTML("beforeend", card);
    }
  };

  const addToCart = async (e) => {
    const target = e.target.closest(".buy-btn");

    if (target) {
      const card = target.closest(".card");
      const nameElement = card.querySelector(".name");
      const priceElement = card.querySelector(".price");
      const name = nameElement.textContent.split(":")[1].trim();
      const price = parseInt(
        priceElement.textContent.split(":")[1].trim().slice(1)
      );
      // const productId = prodIdElement.textContent
      // const res = await fetch(`${serverURL}/?category_name=${categoryName}`{
      //   method:'GET'
      // })

      // const obj  =  { name: name, count:1, price:+price ,totalPrice :+price }
      const existProd = cart.data.findIndex((item) => item.name === name);
      if (existProd !== -1) {
        cart.data[existProd].count += 1;
        cart.data[existProd].totalPrice += price;
      } else {
        const obj = { name: name, count: 1, price: price, totalPrice: price };
        cart.data.push(obj);
      }
      cart.total = cart.data.reduce((acc, item) => acc + item.totalPrice, 0);
      saveCartToLocalStorage();
    }
    // saveCartToLocalStorage();
  };
  const showCart = () => {
    // let data = localStorage.getItem("cart");
    // console.log(data);
    loadCartFromLocalStorage();
    toggleElems(productsSection, cartSection);

    cart.data.forEach((item) => {
      const cartDiv = `
      <div class="item">
      <div class="buttons">
        <span class="delete-btn"></span>
        <span class="like-btn"></span>
      </div>
      <div class="cart-description">
        <span>${item.name}</span>
      </div>
   
      <div class="quantity">
        <button class="plus-btn" type="button" name="button">
          <img src="./images/plus.svg" alt="" />
        </button>
        <form action="" class="rofl">
        <input type="text" name="name" value="${item.count}" class="count">
        </form>
        <button class="minus-btn" type="button" name="button">
          <img src="./images/minus.svg" alt="" />
        </button>
      </div>
   
      <div class="total-price">$${item.totalPrice}</div>
      <div class="price hide">$${item.price}</div>
    </div>
      `;
      shoppingCart.insertAdjacentHTML("beforeend", cartDiv);
    });
    cart.total = 0;
    cart.data.forEach((item) => (cart.total += item.totalPrice));
    totalSpan.textContent = cart.total;
    cartBtn.textContent = "Back";
    saveCartToLocalStorage();
  };
  const loadCartFromLocalStorage = () => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      cart = JSON.parse(storedCart);
    }
  };

  const init = async () => {
    await authMe();
    await showCategory();
    loadCartFromLocalStorage();
  };
  // const logOut = async () => {
  //   const headers = {
  //     accept: "application/json",
  //   };
  //   const res = await fetch(`${serverURL}/auth/logout`, {
  //     method: "POST",
  //     headers: headers,
  //     body: "",
  //   });
  //   // if (res.ok) {
  //   //   const logoutData = await res.json();
  //   //   console.log(logoutData);
  //   // }
  // };
  shoppingCart.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-btn");
    const plusButton = e.target.closest(".plus-btn");
    const minusButton = e.target.closest(".minus-btn");
    const item = e.target.closest(".item");
    const itemName = item.querySelector(".cart-description span").textContent;
    const itemIndex = cart.data.findIndex((item) => item.name === itemName);

    if (deleteBtn) {
      toggleElems(item);
      cart.data.splice(itemIndex, 1);
      item.remove();
      cart.total = cart.data.reduce((acc, item) => acc + item.totalPrice, 0);
      totalSpan.textContent = cart.total;
      saveCartToLocalStorage();
    }
    if (plusButton || minusButton) {
      const item = plusButton
        ? plusButton.closest(".item")
        : minusButton.closest(".item");
      const countInput = item.querySelector(".count");
      const totalValue = item.querySelector(".total-price");
      const price = parseFloat(
        item.querySelector(".price").textContent.split("$")[1]
      );
      let count = parseInt(countInput.value);

      if (plusButton) {
        count += 1;
        cart.total = 0;
        cart.data.forEach((item) => (cart.total += item.totalPrice));
        totalSpan.textContent = cart.total;
      } else {
        if (count > 1) {
          count -= 1;
          cart.total = 0;
          cart.data.forEach((item) => (cart.total -= item.totalPrice));
          totalSpan.textContent = cart.total;
        }
      }

      countInput.value = count;
      const totalPrice = price * count;
      totalValue.textContent = `$${totalPrice.toFixed(2)}`;

      const itemName = item.querySelector(".cart-description span").textContent;
      const itemIndex = cart.data.findIndex((item) => item.name === itemName);
      if (itemIndex !== -1) {
        cart.data[itemIndex].count = count;
        cart.data[itemIndex].totalPrice = totalPrice;
        cart.total = cart.data.reduce((acc, item) => acc + item.totalPrice, 0);
        totalSpan.textContent = cart.total;
        saveCartToLocalStorage();
      }
    }
    const roflForm = item.querySelector(".rofl");
    const totalValue = item.querySelector(".total-price");
    const price = parseFloat(
      item.querySelector(".price").textContent.split("$")[1]
    );
    roflForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const countInput = item.querySelector(".count");
      let count = parseInt(countInput.value);
      const totalPrice = price * count;
      totalValue.textContent = `$${totalPrice.toFixed(2)}`;
      if (itemIndex !== -1) {
        cart.data[itemIndex].count = count;
        cart.data[itemIndex].totalPrice = totalPrice;
        cart.total = cart.data.reduce((acc, item) => acc + item.totalPrice, 0);
        totalSpan.textContent = cart.total;
        saveCartToLocalStorage();
      }
    });
  });
  // logoutBtn.addEventListener("click", logOut);
  cartBtn.addEventListener("click", showCart);
  products.addEventListener("click", addToCart);
  subSide.addEventListener("click", (e) => {
    getProducts(e);
  });

  toggleSignInBtn.addEventListener("click", () => {
    toggleElems(signInBlock, signUpBlock);
  });

  toggleSignUpBtn.addEventListener("click", () => {
    toggleElems(signInBlock, signUpBlock);
  });

  signUpForm.addEventListener("submit", userRegister);
  signInForm.addEventListener("submit", userLogin);

  paginationContainer.addEventListener("click", openProductsPage);
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchProduct(e);
  });
  await init();
});
