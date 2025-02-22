const express = require('express');
const { resolve } = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3010;

app.use(express.json());
app.use(cors());
app.use(express.static('static'));

const db = async () => {
  try {
    await mongoose.connect('mongodb+srv://root:root@cluster0.4fwvc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (e) {
    console.log("MongoDB Connection Error:", e);
  }
};
db();

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true }
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

app.get('/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch menu items", error });
  }
});

app.post('/menu', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }
    const newItem = new MenuItem({ name, description, price });
    await newItem.save();
    res.status(201).json({ message: "Menu item added", newItem });
  } catch (error) {
    res.status(500).json({ message: "Failed to add menu item", error });
  }
});

app.put('/menu/:id', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price },
      { new: true, runValidators: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json({ message: "Menu item updated", updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Failed to update menu item", error });
  }
});

app.delete('/menu/:id', async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json({ message: "Menu item deleted", deletedItem });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete menu item", error });
  }
});

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
