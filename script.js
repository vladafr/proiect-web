const express = require('express');
const Sequelize = require('sequelize')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'products.db'
})

const Products = sequelize.define('Products', {
    Id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Name: Sequelize.STRING,
    Price: Sequelize.NUMBER,
    OrderNum: Sequelize.INTEGER,
    Rating: Sequelize.INTEGER
}, { timestamps: false })

sequelize.sync({ alter: true })
    .then(() => {
        console.log('tables created')
    })

const app = express()
const port = 3000

app.use((req, res, next) => {
    console.log(req.method + ' ' + req.url)
    next()
})
app.use(express.static('public'))
app.use(express.json())

app.get('/products', async (req, res, next) => {
    try {
        const products = await Products.findAll()
        res.status(200).json(products)
    } catch (error) {
        next(error)
    }
})

app.get('/product/:id', async (req, res, next) => {
    try {
        const product = await Products.findByPk(req.params.id)
        res.status(200).json(product)
    } catch (error) {
        next(error)
    }
})

app.delete('/product/:id', async (req, res, next) => {
    try {
        const product = await Products.findByPk(req.params.id)
        if (product) {
            await product.destroy()
            res.status(202).send({ message: 'accepted' })
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (error) {
        next(error)
    }
})

app.post('/products', async (req, res, next) => {
    try {
        const product = await Products.create(req.body)
        res.status(201).json(product)
    } catch (error) {
        next(error)
    }
})

app.put('/products/:id', async (req, res, next) => {
    try {
        const product = await Products.findByPk(req.params.id)
        if (product) {
            // res.json(req.body)
            product.Name = req.body.Name
            product.Price = req.body.Price
            product.OrderNum = req.body.OrderNum
            product.Rating = req.body.Rating
            await product.save()
            res.status(202).json({ message: 'accepted' })
        } else {
            res.status(404).json({ message: 'not found' })
        }
    } catch (error) {
        next(error)
    }
})

app.use((err, req, res, next) => {
    console.warn(err)
    res.status(500).json({ message: 'server error' })
})

app.listen(port)