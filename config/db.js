const mongoose = require('mongoose')
const config = require('config')

const connectToDB = async function connectToDB() {
    //Connect to DB
    try {
        await mongoose.connect(config.get('uri'), {
            useNewUrlParser: true
        })

        console.log('We in there')

    } catch (err) {
        console.log('DB connection error')
    }

}

module.exports = connectToDB