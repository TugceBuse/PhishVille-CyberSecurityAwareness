import React, { useState } from "react";
import styles from "./NovaTekno.module.css";
import { useEventLog } from "../../Contexts/EventLogContext";

const products = [
  { id: 1, name: "Kampanya Laptop", price: 17999, image: "/techdepo/computer1.jpg", category: "laptop" },
  { id: 2, name: "Bluetooth Kulaklık", price: 749, image: "/techDepo/head2.jpg", category: "headphone" },
  { id: 3, name: "Gaming Mouse", price: 299, image: "/techDepo/mouse2.jpg", category: "mouse" },
  { id: 4, name: "RGB Ergonomik Klavye", price: 529, image: "/techDepo/key3.jpg", category: "keyboard" },
  { id: 5, name: "JetPrint Yazıcı", price: 2499, image: "/techDepo/printer1.jpg", category: "printer" },
];

const NovaTekno = () => {
  const {addEventLog} = useEventLog();
  const [cart, setCart] = useState([]);
  const [page, setPage] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [paymentStep, setPaymentStep] = useState(1);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const filteredProducts = products.filter(
    (p) => selectedCategory === "all" || p.category === selectedCategory
  );

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 onClick={() => setPage("home")}>NovaTekno</h1>
        <div>
          <button onClick={() => setPage("products")} className={styles.pageButton}>Ürünler</button>
          <button onClick={() => setPage("cart")} className={styles.cartButton}>
            Sepet ({cart.reduce((t, i) => t + i.quantity, 0)})
          </button>
        </div>
      </header>

      {page === "home" && (
        <div className={styles.homeBox}>
          <h2>⚡ NovaTekno'ya Hoş Geldiniz!</h2>
          <p>✅ NovaTekno, kayıt ve üyelik gibi zaman kaybettiren süreçlerle uğraştırmaz. Misafir olarak tek tıkla sipariş verebilir, dakikalar içinde ödemenizi tamamlayabilirsiniz.</p>
          <p>🚚 Tüm siparişlerimiz doğrudan kendi depolarımızdan kargoya verilir. Aracı satıcı yok, ek ücret yok, sürpriz yok.</p>
          <p>💳 Gelişmiş ödeme altyapımız sayesinde kart bilgilerinizi hızlı ve güvenli bir şekilde girerek işleminizi saniyeler içinde tamamlayabilirsiniz.</p>
          <p>🎯 NovaTekno’da her şey sade, net ve hızlı. Beklemeye gerek yok, hemen alışverişe başlayın!</p>
        </div>
      )}

      {page === "products" && (
        <div className={styles.productsPage}>
          <aside className={styles.sidebar}>
            <h3>Kategoriler</h3>
            <ul>
              <li onClick={() => setSelectedCategory("all")} className={`${styles.categoryItem} ${selectedCategory === "all" ? styles.active : ""}`}>Tümü</li>
              <li onClick={() => setSelectedCategory("laptop")} className={`${styles.categoryItem} ${selectedCategory === "laptop" ? styles.active : ""}`}>Laptop</li>
              <li onClick={() => setSelectedCategory("headphone")} className={`${styles.categoryItem} ${selectedCategory === "headphone" ? styles.active : ""}`}>Kulaklık</li>
              <li onClick={() => setSelectedCategory("mouse")} className={`${styles.categoryItem} ${selectedCategory === "mouse" ? styles.active : ""}`}>Fare</li>
              <li onClick={() => setSelectedCategory("keyboard")} className={`${styles.categoryItem} ${selectedCategory === "keyboard" ? styles.active : ""}`}>Klavye</li>
              <li onClick={() => setSelectedCategory("printer")} className={`${styles.categoryItem} ${selectedCategory === "printer" ? styles.active : ""}`}>Yazıcı</li>
            </ul>
          </aside>

          <div className={styles.grid}>
            {filteredProducts.map((p) => (
              <div key={p.id} className={styles.card}>
                <img src={p.image} alt={p.name} />
                <h3>{p.name}</h3>
                <p>₺{p.price}</p>
                <button onClick={() => addToCart(p)}>Sepete Ekle</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "cart" && (
        <div className={styles.cart}>
          <h2>Sepet</h2>
          {cart.length === 0 ? (
            <p className={styles.emptyCartText}>Sepetiniz boş</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <img src={item.image} alt={item.name} />
                  <div className={styles.itemDetails}>
                    <span>{item.name}</span>
                    <div className={styles.quantityButtons}>
                      <button className={styles.quantityButtond} onClick={() => removeFromCart(item.id)}>-</button>
                      <span className={styles.itemQuantity}>x{item.quantity}</span>
                      <button className={styles.quantityButtoni} onClick={() => addToCart(item)}>+</button>
                    </div>
                  </div>
                  <div className={styles.itemPrice}>₺{item.price * item.quantity}</div>
                </div>
              ))}
              <div className={styles.totalAmount}>Toplam: ₺{totalAmount}</div>
              <button
                className={styles.checkoutButton}
                onClick={() => {
                  setPage("payment");
                  setPaymentStep(1);
                }}
              >
                Sepeti Onayla
              </button>
              <button
                className={styles.clearCartButton}
                onClick={clearCart}
              >
                Sepeti Temizle
              </button>
            </>
          )}
        </div>
      )}

      {page === "payment" && (
        <div className={styles.paymentStep}>
          {paymentStep === 1 && (
            <>
              <h2>Teslimat Bilgileri</h2>
              <input type="text" required placeholder="Ad Soyad" />
              <input type="text" required placeholder="Adres" />
              <input type="text" required placeholder="Telefon" />
              <button onClick={() => setPaymentStep(2)}>Devam Et</button>
            </>
          )}
          {paymentStep === 2 && (
            <>
              <h2>Kart Bilgileri</h2>
              <input type="text" required placeholder="Kart Üzerindeki Ad Soyad" />
              <input type="text" required placeholder="Kart Numarası" />
              <input type="text" required placeholder="Son Kullanma Tarihi" />
              <input type="text" required placeholder="CVV" />
              <button
                onClick={() => {
                  const boughtPrinter = cart.some(item => item.id === 5);

                  setCart([]);
                  setPage("home");

                  addEventLog({
                    type: "payment",
                    questId: boughtPrinter ? "buy_printer" : null,
                    logEventType: "e-commerce",
                    value: -10,
                    data: {
                      store: "NovaTekno",
                      isFake: true,
                    }
                  });
                }}
              >
                Ödemeyi Tamamla
              </button>
            </>
          )}
        </div>
      )}

      <footer className={styles.footer}>© 2025 NovaTekno</footer>
    </div>
  );
};

export default NovaTekno;
