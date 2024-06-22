const validateProductFields = (data) => {

    const { name, description, price, discount, link, collection } = data;
    if (!name) return { valid: false, message: 'Name is required.' };
    if (!description) return { valid: false, message: 'Description is required.' };
    if (!price) return { valid: false, message: 'Price is required.' };
    if (!discount) return { valid: false, message: 'Discount is required.' };
    if (!link) return { valid: false, message: 'Link is required.' };
    if (!collection) return { valid: false, message: 'Collection is required.' };

    return { valid: true };
};

module.exports = {
    validateProductFields,
};
