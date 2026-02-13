import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
	product_id: String,
	product_name: String,
	category: String,
	quantity: Number,
	unit_price: Number,
	discount: Number
});

const TransactionSchema = new mongoose.Schema({
	transaction_id: { type: String, unique: true },
	store: String,
	neighborhood: String,
	timestamp: Date,
	payment_type: String,
	total_amount: Number,
	discount_amount: Number,
	items: [ItemSchema]
});

const ProductSchema = new mongoose.Schema({
	product_id: { type: String, unique: true },
	product_name: String,
	category: String
});

const UserSchema = new mongoose.Schema({
	username: { type: String, unique: true },
	password: String,
	role: String
});

const EmployeeSchema = new mongoose.Schema({
	name: String,
	role: String,
	department: String,
	startDate: Date,
	performance: Number,
	attendance: Number,
	productivity: Number,
	satisfaction: Number
});

export const Transaction = mongoose.model('Transaction', TransactionSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const User = mongoose.model('User', UserSchema);
export const Employee = mongoose.model('Employee', EmployeeSchema);
