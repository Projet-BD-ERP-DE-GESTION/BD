import React, { Component } from 'react';
import sampleData from '../../data/sample_transactions_weekly.json';

class CashierRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cashier: {
        id: 'E002',
        name: 'Pierre Dubois',
        store: 'Supermarché Central',
        role: 'Caissier',
        shift: 'Matin (09:00 - 17:00)'
      },
      cart: [],
      currentProduct: {
        id: '',
        name: '',
        price: '',
        quantity: 1,
        category: '',
        qrCode: ''
      },
      transactions: [],
      totalAmount: 0,
      discount: 0,
      paymentMethod: 'cash',
      showReceipt: false,
      lastTransaction: null,
      searchResults: [],
      showSearch: false
    };
    this.qrInput = React.createRef();
  }

  componentDidMount() {
    // Focus on QR code input by default
    if (this.qrInput.current) {
      this.qrInput.current.focus();
    }
  }

  handleProductInput = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      currentProduct: {
        ...prevState.currentProduct,
        [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
      }
    }));
  };

  handleQRScan = (e) => {
    const qrCode = e.target.value;
    if (qrCode.length > 0) {
      // Simulate QR code lookup - in real app, would query database
      const mockProducts = [
        { id: 'P001', name: 'Lait 1L', price: 1.50, category: 'Boissons', qr: '5901234123457' },
        { id: 'P010', name: 'Pain complet', price: 2.50, category: 'Boulangerie', qr: '5901234123458' },
        { id: 'P100', name: 'Poulet entier', price: 15.00, category: 'Viande', qr: '5901234123459' },
        { id: 'P050', name: 'Riz 5kg', price: 20.00, category: 'Epicerie', qr: '5901234123460' }
      ];

      const foundProduct = mockProducts.find(p => p.qr === qrCode);
      if (foundProduct) {
        this.setState(prevState => ({
          currentProduct: {
            id: foundProduct.id,
            name: foundProduct.name,
            price: foundProduct.price,
            quantity: 1,
            category: foundProduct.category,
            qrCode: qrCode
          }
        }));
        e.target.value = '';
      }
    }
  };

  addToCart = () => {
    const { currentProduct, cart } = this.state;
    
    if (!currentProduct.name || !currentProduct.price || currentProduct.quantity <= 0) {
      alert('Veuillez entrer les informations du produit');
      return;
    }

    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
      existingItem.quantity += currentProduct.quantity;
    } else {
      cart.push({ ...currentProduct });
    }

    this.calculateTotal();
    this.setState({
      currentProduct: {
        id: '',
        name: '',
        price: '',
        quantity: 1,
        category: '',
        qrCode: ''
      },
      cart
    });

    // Focus back on QR input
    if (this.qrInput.current) {
      this.qrInput.current.focus();
    }
  };

  removeFromCart = (index) => {
    const { cart } = this.state;
    cart.splice(index, 1);
    this.calculateTotal();
    this.setState({ cart });
  };

  calculateTotal = () => {
    const { cart, discount } = this.state;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = Math.max(0, subtotal - discount);
    this.setState({ totalAmount });
  };

  handleDiscount = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    this.setState({ discount }, this.calculateTotal);
  };

  completeTransaction = () => {
    const { cart, cashier, totalAmount, discount, paymentMethod } = this.state;

    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }

    const transaction = {
      transaction_id: `T${Date.now()}`,
      store: cashier.store,
      cashier_id: cashier.id,
      cashier_name: cashier.name,
      timestamp: new Date().toISOString(),
      payment_type: paymentMethod,
      total_amount: totalAmount,
      discount_amount: discount,
      items: cart,
      item_count: cart.length
    };

    this.setState(prevState => ({
      transactions: [transaction, ...prevState.transactions],
      lastTransaction: transaction,
      showReceipt: true,
      cart: [],
      totalAmount: 0,
      discount: 0,
      paymentMethod: 'cash'
    }));
  };

  closeReceipt = () => {
    this.setState({ showReceipt: false });
    if (this.qrInput.current) {
      this.qrInput.current.focus();
    }
  };

  render() {
    const { cashier, cart, currentProduct, totalAmount, discount, paymentMethod, showReceipt, lastTransaction, transactions } = this.state;

    return (
      <div>
        {/* Header with Cashier Info */}
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Caisse Enregistreuse</h4>
              <p>Enregistrement des ventes</p>
            </div>
          </div>
        </div>

        {/* Cashier Info Card */}
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <p className="mb-1"><strong>Caissier:</strong> {cashier.name}</p>
                      <p className="mb-1"><strong>ID:</strong> {cashier.id}</p>
                      <p className="mb-1"><strong>Rôle:</strong> {cashier.role}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <p className="mb-1"><strong>Magasin:</strong> {cashier.store}</p>
                      <p className="mb-1"><strong>Quart:</strong> {cashier.shift}</p>
                      <p className="mb-1"><strong>Heure:</strong> {new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Product Entry Section */}
          <div className="col-md-8 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Ajouter un Produit</h4>

                {/* QR Code Input */}
                <div className="form-group mb-3">
                  <label htmlFor="qrCode">Code QR (Scanner)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="qrCode"
                    placeholder="Scannez le code QR du produit..."
                    ref={this.qrInput}
                    onBlur={(e) => this.handleQRScan(e)}
                  />
                  <small className="text-muted">Ex: 5901234123457</small>
                </div>

                {/* Product Details */}
                <div className="row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="productName">Nom du Produit</label>
                    <input
                      type="text"
                      className="form-control"
                      id="productName"
                      name="name"
                      value={currentProduct.name}
                      onChange={this.handleProductInput}
                      placeholder="Nom du produit"
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="category">Catégorie</label>
                    <input
                      type="text"
                      className="form-control"
                      id="category"
                      name="category"
                      value={currentProduct.category}
                      onChange={this.handleProductInput}
                      placeholder="Catégorie"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 form-group">
                    <label htmlFor="price">Prix Unitaire (€)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      name="price"
                      value={currentProduct.price}
                      onChange={this.handleProductInput}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="col-md-6 form-group">
                    <label htmlFor="quantity">Quantité</label>
                    <input
                      type="number"
                      className="form-control"
                      id="quantity"
                      name="quantity"
                      value={currentProduct.quantity}
                      onChange={this.handleProductInput}
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-lg btn-block mt-3"
                  onClick={this.addToCart}
                >
                  <i className="mdi mdi-plus"></i> Ajouter au Panier
                </button>
              </div>
            </div>

            {/* Transactions History */}
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title mb-3">Historique des Ventes ({transactions.length})</h5>
                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Heure</th>
                        <th>Montant</th>
                        <th>Articles</th>
                        <th>Paiement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((txn, idx) => (
                        <tr key={idx}>
                          <td>{new Date(txn.timestamp).toLocaleTimeString()}</td>
                          <td className="font-weight-bold">{txn.total_amount.toFixed(2)} €</td>
                          <td>{txn.item_count}</td>
                          <td><span className="badge badge-info">{txn.payment_type}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary Section */}
          <div className="col-md-4 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Panier</h4>

                {/* Cart Items */}
                <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                  {cart.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <p>Le panier est vide</p>
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <div key={index} className="card mb-2 border">
                        <div className="card-body p-2">
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <div>
                              <h6 className="mb-0">{item.name}</h6>
                              <small className="text-muted">{item.category}</small>
                            </div>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => this.removeFromCart(index)}
                            >
                              <i className="mdi mdi-delete"></i>
                            </button>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span>
                              {item.quantity} x {item.price.toFixed(2)} €
                            </span>
                            <strong>{(item.price * item.quantity).toFixed(2)} €</strong>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals */}
                <div className="border-top pt-3">
                  <div className="row mb-2">
                    <div className="col-8">
                      <p className="mb-0">Sous-total:</p>
                    </div>
                    <div className="col-4 text-right">
                      <p className="mb-0">{(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2)} €</p>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-8">
                      <label htmlFor="discount" className="mb-0">Remise:</label>
                    </div>
                    <div className="col-4">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        id="discount"
                        value={discount}
                        onChange={this.handleDiscount}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="row mb-3 bg-light p-2 rounded">
                    <div className="col-8">
                      <h5 className="mb-0">TOTAL:</h5>
                    </div>
                    <div className="col-4 text-right">
                      <h5 className="mb-0 text-primary">{totalAmount.toFixed(2)} €</h5>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="form-group mb-3">
                    <label htmlFor="paymentMethod">Mode de Paiement</label>
                    <select
                      className="form-control"
                      id="paymentMethod"
                      value={paymentMethod}
                      onChange={(e) => this.setState({ paymentMethod: e.target.value })}
                    >
                      <option value="cash">Espèces</option>
                      <option value="card">Carte</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="check">Chèque</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <button
                    className="btn btn-success btn-lg btn-block mb-2"
                    onClick={this.completeTransaction}
                    disabled={cart.length === 0}
                  >
                    <i className="mdi mdi-check"></i> Valider la Vente
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-block"
                    onClick={() => this.setState({ cart: [], totalAmount: 0, discount: 0 })}
                    disabled={cart.length === 0}
                  >
                    <i className="mdi mdi-refresh"></i> Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceipt && lastTransaction && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-sm">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">✓ Vente Enregistrée</h5>
                  <button 
                    type="button" 
                    className="close text-white" 
                    onClick={this.closeReceipt}
                  >
                    <span>×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="text-center mb-3">
                    <h2 className="text-success mb-0">✓</h2>
                    <p className="mb-1"><strong>Transaction réussie</strong></p>
                  </div>

                  <div className="receipt-content bg-light p-3 rounded">
                    <p className="mb-1"><small>ID Transaction: {lastTransaction.transaction_id}</small></p>
                    <p className="mb-2"><small>{new Date(lastTransaction.timestamp).toLocaleString()}</small></p>
                    
                    <div className="border-top border-bottom py-2 my-2">
                      <p className="mb-1">Articles: <strong>{lastTransaction.item_count}</strong></p>
                      <p className="mb-0">Montant: <strong className="text-success">{lastTransaction.total_amount.toFixed(2)} €</strong></p>
                      {lastTransaction.discount_amount > 0 && (
                        <p className="mb-0">Remise: <strong>-{lastTransaction.discount_amount.toFixed(2)} €</strong></p>
                      )}
                    </div>

                    <p className="mb-1"><small>Paiement: <strong>{lastTransaction.payment_type}</strong></small></p>
                    <p className="mb-0"><small>Caissier: <strong>{lastTransaction.cashier_name}</strong></small></p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-primary btn-block"
                    onClick={this.closeReceipt}
                  >
                    Nouvelle Vente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default CashierRegister;
