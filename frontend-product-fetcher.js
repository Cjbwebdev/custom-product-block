document.addEventListener("DOMContentLoaded", () => {
    // Select all the product blocks in the DOM
    const productBlocks = document.querySelectorAll(".product-block");

    // wp-api script is loaded in the main plugin file
    const apiBaseUrl = wpApiSettings.root + 'wp/v2/product?include=';

    productBlocks.forEach((block) => {
        const productIds = JSON.parse('[' + block.getAttribute("data-product-ids") + ']');

        // If no products are selected in the editor, display a message
        if (!productIds || productIds.length === 1) {
            block.innerHTML += "<p>No products selected.</p>";
            return;
        }

        // Fetch product data from the WordPress REST API
        fetch(`${apiBaseUrl}${productIds.join(",")}`)
            .then((response) => {
                // Handle potential errors in the response
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((products) => {
                // If no products returned, handle that case
                if (!Array.isArray(products) || products.length === 0) {
                    block.innerHTML += "<p>No products found.</p>";
                    return;
                }

                // Create the product list container
                const productList = document.createElement("div");
                productList.classList.add("product-list");

                // Loop through each product and create its HTML
                products.forEach((product) => {
                    const productItem = document.createElement("div");
                    productItem.classList.add("product-item");

                    // Construct the product image, title, and price
                    const productImage = product.featured_media_url
                        ? `<img src="${product.featured_media_url}" alt="${product.title.rendered}" />`
                        : `<img src="https://via.placeholder.com/150" alt="Placeholder image" />`;
                    const productTitle = `<a href="${product.link}" target="_blank"><h3>${product.title.rendered}</h3></a>`;
                    const productPrice = product.price_html
                        ? `<p>${product.price_html}</p>`
                        : product.price
                        ? `<p>${product.price}</p>`
                        : "<p>Price not available</p>";

                    // Add the HTML content to the product item
                    productItem.innerHTML = `${productImage}${productTitle}${productPrice}`;

                    // Append the product item to the list
                    productList.appendChild(productItem);
                });

                // Append the product list to the block
                block.appendChild(productList);
            })
            .catch((error) => {
                // If there was an error fetching the products, show an error message
                block.innerHTML += "<p>Failed to load products.</p>";
                console.error("Error fetching products:", error);
            });
    });
});
