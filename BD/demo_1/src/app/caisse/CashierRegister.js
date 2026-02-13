import React, { Component } from 'react';
import sampleData from '../../data/sample_transactions_weekly.json';

class CashierRegisterSingleStore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cashier: {
        id: 'E002',
        name: 'Pierre Dubois',
        role: 'Caissier',
        store: 'Supermarché Central',
        shift: 'Matin (09:00 - 17:00)'
      },
      cart: [],
      currentProduct: {
        name: '',
        category: '',
        price: '',
        quantity: ''
      },
      qrInput: '',
      transactions: sampleData.slice(0, 10),
      totalAmount: 0,
      discount: 0,
      paymentMethod: 'cash',
      lastTransaction: null,
      showReceipt: false,
      mockProducts: {
        '8719324120931': { name: 'Lait 1L', category: 'Boissons', price: 1.20, qty: 50 },
        '8719324120932': { name: 'Pain Blanc', category: 'Boulangerie', price: 0.95, qty: 120 },
        '8719324120933': { name: 'Tomate Ronde', category: 'Fruits & Légumes', price: 2.50, qty: 80 },
        '8719324120934': { name: 'Oeufs 12pcs', category: 'Produits Laitiers', price: 3.50, qty: 40 }
      }
    };
    this.qrRef = React.createRef();
  }

  componentDidMount() {
    if (this.qrRef.current) {
      this.qrRef.current.focus();
    }
  }

  handleProductInput = (e) => {
    const { name, value } = e.target;
    this.setState({
      currentProduct: {
        ...this.state.currentProduct,
        [name]: value
      }
    });
  };

  handleQRScan = (e) => {
    const qrCode = e.target.value;
    if (qrCode.length > 10 && e.key === 'Enter') {
      const product = this.state.mockProducts[qrCode];
      if (product) {
        this.setState(prev => ({
          cart: [...prev.cart, {
            id: qrCode,
            name: product.name,
            category: product.category,
            price: product.price,
            quantity: 1,
            total: product.price
          }],
          qrInput: ''
        }), this.calculateTotal);
      } else {
        alert('Produit non trouvé');
        this.setState({ qrInput: '' });
      }
      if (this.qrRef.current) {
        this.qrRef.current.focus();
      }
    } else {
      this.setState({ qrInput: qrCode });
    }
  };

  addToCart = () => {
    const { currentProduct, cart } = this.state;
    if (!currentProduct.name || !currentProduct.price || !currentProduct.quantity) {
      alert('Remplissez tous les champs');
      return;
    }

    const newItem = {
      id: Date.now(),
      name: currentProduct.name,
      category: currentProduct.category,
      price: parseFloat(currentProduct.price),
      quantity: parseInt(currentProduct.quantity),
      total: parseFloat(currentProduct.price) * parseInt(currentProduct.quantity)
    };

    this.setState({
      cart: [...cart, newItem],
      currentProduct: { name: '', category: '', price: '', quantity: '' }
    }, this.calculateTotal);
  };

  removeFromCart = (id) => {
    this.setState(prev => ({
      cart: prev.cart.filter(item => item.id !== id)
    }), this.calculateTotal);
  };

  calculateTotal = () => {
    const { cart, discount } = this.state;
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const total = Math.max(0, subtotal - discount);
    this.setState({ totalAmount: total });
  };

  handleDiscountChange = (e) => {
    const discount = parseFloat(e.target.value) || 0;
    this.setState({ discount }, this.calculateTotal);
  };

  handlePaymentMethodChange = (e) => {
    this.setState({ paymentMethod: e.target.value });
  };

  completeTransaction = () => {
    const { cart, totalAmount, discount, paymentMethod, cashier } = this.state;

    if (cart.length === 0) {
      alert('Le panier est vide');
      return;
    }

    const transaction = {
      id: `TXN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      cashier_id: cashier.id,
      cashier_name: cashier.name,
      items: cart,
      subtotal: cart.reduce((sum, item) => sum + item.total, 0),
      discount_amount: discount,
      total_amount: totalAmount,
      payment_type: paymentMethod
    };

    this.setState(prev => ({
      lastTransaction: transaction,
      showReceipt: true,
      transactions: [transaction, ...prev.transactions].slice(0, 10),
      cart: [],
      totalAmount: 0,
      discount: 0,
      currentProduct: { name: '', category: '', price: '', quantity: '' }
    }), () => {
      if (this.qrRef.current) {
        this.qrRef.current.focus();
      }
    });
  };

  closeReceipt = () => {
    this.setState({ showReceipt: false });
    if (this.qrRef.current) {
      this.qrRef.current.focus();
    }
  };

  render() {
    const { cashier, cart, currentProduct, qrInput, transactions, totalAmount, discount, paymentMethod, lastTransaction, showReceipt } = this.state;
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);

    return (
      <div>
        <div className="row page-title-header">
          <div className="col-12">
            <div className="page-header">
              <h4 className="page-title">Enregistrement des Ventes</h4>
              <p>Caisse - {cashier.store}</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-3">Informations Caissier</h4>
                <p className="mb-2"><strong>Nom:</strong> {cashier.name}</p>
                <p className="mb-2"><strong>ID:</strong> {cashier.id}</p>
                <p className="mb-2"><strong>Rôle:</strong> {cashier.role}</p>
                <p className="mb-2"><strong>Magasin:</strong> {cashier.store}</p>
                <p className="mb-0"><strong>Shift:</strong> {cashier.shift}</p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-3">Scan QR Code</h4>
                <input
                  ref={this.qrRef}
                  type="text"
                  className="form-control"
                  placeholder="Scannez un produit..."
                  value={qrInput}
                  onChange={(e) => this.setState({ qrInput: e.target.value })}
                  onKeyDown={this.handleQRScan}
                  autoFocus
                />
                <small className="text-muted mt-2">Codes test: 8719324120931, 8719324120932, 8719324120933, 8719324120934</small>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-3">Entrée Manuelle</h4>
                <div className="form-group mb-2">
                  <label className="small">Produit</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="name"
                    value={currentProduct.name}
                    onChange={this.handleProductInput}
                    placeholder="Nom du produit"
                  />
                </div>
                <div className="form-group mb-2">
                  <label className="small">Catégorie</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    name="category"
                    value={currentProduct.category}
                    onChange={this.handleProductInput}
                    placeholder="Catégorie"
                  />
                </div>
                <div className="form-group mb-2">
                  <label className="small">Prix (€)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    name="price"
                    value={currentProduct.price}
                    onChange={this.handleProductInput}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div className="form-group mb-2">
                  <label className="small">Quantité</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    name="quantity"
                    value={currentProduct.quantity}
                    onChange={this.handleProductInput}
                    placeholder="1"
                  />
                </div>
                <button className="btn btn-primary btn-sm btn-block" onClick={this.addToCart}>
                  Ajouter au Panier
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-8 grid-margin">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-4">Panier d'Achat</h4>
                
                {cart.length === 0 ? (
                  <p className="text-muted">Le panier est vide</p>
                ) : (
                  <div className="table-responsive mb-4">
                    <table className="table table-hover table-sm">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Catégorie</th>
                          <th>Prix</th>
                          <th>Qté</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map(item => (
                          <tr key={item.id}>
                            <td>{item.name}</td>
                            <td><small>{item.category}</small></td>
                            <td>{item.price.toFixed(2)} €</td>
                            <td>{item.quantity}</td>
                            <td className="font-weight-bold">{item.total.toFixed(2)} €</td>
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => this.removeFromCart(item.id)}
                              >
                                <i className="mdi mdi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label><strong>Mode de Paiement</strong></label>
                      <select
                        className="form-control"
                        value={paymentMethod}
                        onChange={this.handlePaymentMethodChange}
                      >
                        <option value="cash">Espèces</option>
                        <option value="card">Carte Bancaire</option>
                        <option value="mobile">Portefeuille Mobile</option>
                        <option value="check">Chèque</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label><strong>Remise (€)</strong></label>
                      <input
                        type="number"
                        className="form-control"
                        value={discount}
                        onChange={this.handleDiscountChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="card bg-light">
                  <div className="card-body">
                    <h5 className="mb-3">Résumé</h5>
                    <p className="mb-2"><strong>Sous-total:</strong> {subtotal.toFixed(2)} €</p>
                    <p className="mb-2"><strong>Remise:</strong> -<span className="text-danger">{discount.toFixed(2)} €</span></p>
                    <hr />
                    <h4 className="mb-0">
                      <strong>Total:</strong> <span className="text-primary">{totalAmount.toFixed(2)} €</span>
                    </h4>
                  </div>
                </div>

                <button
                  className="btn btn-success btn-lg btn-block mt-3"
                  onClick={this.completeTransaction}
                  disabled={cart.length === 0}
                >
                  <i className="mdi mdi-check-circle"></i> Valider la Transaction
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h4 className="card-title mb-3">Historique des Transactions</h4>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th>Heure</th>
                        <th>Montant</th>
                        <th>Articles</th>
                        <th>Mode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 10).map((txn, idx) => (
                        <tr key={idx}>
                          <td><small>{new Date(txn.timestamp).toLocaleTimeString()}</small></td>
                          <td className="font-weight-bold">{Number(txn.total_amount || 0).toFixed(2)} €</td>
                          <td>{(txn.items || []).length}</td>
                          <td><small>{txn.payment_type}</small></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Modal */}
        {showReceipt && lastTransaction && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">Reçu de Transaction</h5>
                  <button type="button" className="close text-white" onClick={this.closeReceipt}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="text-center mb-3">
                    <h6>MAGASIN CENTRAL</h6>
                    <p className="mb-1"><small>{cashier.store}</small></p>
                    <p className="mb-3"><small>{new Date(lastTransaction.timestamp).toLocaleString()}</small></p>
                  </div>
                  <hr />
                  <div className="receipt-items mb-3">
                    {lastTransaction.items.map((item, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="d-flex justify-content-between">
                          <small>{item.name}</small>
                          <small className="font-weight-bold">{item.total.toFixed(2)} €</small>
                        </div>
                        <small className="text-muted">{item.quantity} x {item.price.toFixed(2)} €</small>
                      </div>
                    ))}
                  </div>
                  <hr />
                  <p className="mb-1"><strong>Sous-total:</strong> {lastTransaction.subtotal.toFixed(2)} €</p>
                  {lastTransaction.discount_amount > 0 && (
                    <p className="mb-3 text-danger"><strong>Remise:</strong> -{lastTransaction.discount_amount.toFixed(2)} €</p>
                  )}
                  <h5 className="text-success"><strong>Total:</strong> {lastTransaction.total_amount.toFixed(2)} €</h5>
                  <p className="mb-0 mt-2"><strong>Paiement:</strong> {lastTransaction.payment_type}</p>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" onClick={this.closeReceipt}>
                    Fermer
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

export default CashierRegisterSingleStore;
