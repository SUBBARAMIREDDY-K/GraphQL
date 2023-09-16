const mongoose = require('mongoose');


const Schema = mongoose.Schema; //Returns a Constructor

const eventSchema =  new Schema({ // Schema or bluePrint or plan
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    date:{
        type: Date,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

});

module.exports = mongoose.model("Event",eventSchema)