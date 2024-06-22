const Category = require('../../models/category')


exports.getCategory = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send(error);
    }
}

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }
        res.status(200).send(category);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, type } = req.body;
        if (!name || !type) {
            return res.status(400).send('Name and type are required.');
        }
        const category = new Category({ name, type });
        await category.save();
        res.status(201).send(category);
    } catch (error) {
        res.status(500).send(error);
    }
};