const { registerBlockType } = wp.blocks;
const { useState, useEffect } = wp.element;
const { TextControl, SelectControl, PanelBody } = wp.components;
const { InspectorControls } = wp.blockEditor;

registerBlockType('custom/product-block', {
    title: 'Product Block',
    icon: 'cart',
    category: 'widgets',
    attributes: {
        heading: { type: 'string', default: 'Featured Products' },
        selectedProducts: { type: 'array', default: [] }
    },
    edit: ({ attributes, setAttributes }) => {
        const { heading, selectedProducts } = attributes;

        // Local state for product options
        const [productOptions, setProductOptions] = useState([]);
        const [isLoading, setIsLoading] = useState(true);

        // Fetch WooCommerce products
        useEffect(() => {
            const fetchProducts = async () => {
                try {
                    const response = await fetch('/wc/v2/products', {
                        headers: {
                            'Authorization': `Basic ${btoa('ck_b480d7d64dc072b5fcdd83dee2b061204507511e:cs_your_consumer_secret')}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Error fetching products: ${response.statusText}`);
                    }

                    const products = await response.json();
                    const options = products.map((product) => ({
                        value: product.id,
                        label: product.name,
                        imageUrl: product.images?.[0]?.src || 'https://via.placeholder.com/150',
                        price: product.price_html || 'Price not available',
                        link: product.permalink,
                    }));

                    setProductOptions(options);
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchProducts();
        }, []);

        const handleProductSelection = (newProductIds) => {
            setAttributes({ selectedProducts: newProductIds });
        };

        return (
            <>
                <InspectorControls>
                    <PanelBody title="Product Block Settings">
                        <TextControl
                            label="Block Heading"
                            value={heading}
                            onChange={(value) => setAttributes({ heading: value })}
                        />
                        <h4>Select Products to Display</h4>
                        {isLoading ? (
                            <p>Loading products...</p>
                        ) : (
                            <SelectControl
                                multiple
                                label="Products"
                                value={selectedProducts}
                                onChange={handleProductSelection}
                                options={productOptions}
                            />
                        )}
                    </PanelBody>
                </InspectorControls>
                <div className="product-block">
                    <h2>{heading}</h2>
                    <div className="product-list">
                        {selectedProducts.map((productId) => {
                            const product = productOptions.find((p) => p.value === productId);
                            return product ? (
                                <div key={product.value} className="product-item">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.label}
                                        style={{ width: '150px', height: '150px' }}
                                    />
                                    <h3>{product.label}</h3>
                                    <div dangerouslySetInnerHTML={{ __html: product.price }} />
                                </div>
                            ) : (
                                <p>Loading product...</p>
                            );
                        })}
                    </div>
                </div>
            </>
        );
    },
    save: ({ attributes }) => {
        const { heading, selectedProducts } = attributes;
        return (
            <div className="product-block" data-product-ids={selectedProducts.join(',')}>
                <div className="product-list">
                    <h2>{heading}</h2>
                </div>
            </div>
        );
    },
});
