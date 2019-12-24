const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const userSchema = new Schema(
    {
        // r //
        title: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 200
        },
    }
);

module.exports = userSchema
