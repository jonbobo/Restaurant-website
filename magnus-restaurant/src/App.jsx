import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const App = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [activeSection, setActiveSection] = useState('home');

  const totalSlides = 6;

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Navigation functionality - optimized for React
  const navigateToSection = useCallback((sectionId) => {
    setActiveSection(sectionId);

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Delay scroll to ensure DOM has updated
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerHeight = 160;
        const elementPosition = element.offsetTop - headerHeight;
        window.scrollTo({ top: elementPosition, behavior: 'smooth' });
      }
    }, 50);
  }, []);

  // Cart functions - optimized with better state management
  const addToCart = useCallback((name, price, description) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.name === name);

      if (existingItem) {
        return prevCart.map(item =>
          item.name === name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          id: Date.now(), // Add unique ID for better React keys
          name,
          price,
          description,
          quantity: 1
        }];
      }
    });

    // Inline notification to avoid dependency issues
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${name} added to cart!</span>
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => {
      const newState = !prev;
      document.body.style.overflow = newState ? 'hidden' : '';
      return newState;
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(prevCart => prevCart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    if (cart.length === 0) {
      alert('Your cart is already empty!');
      return;
    }

    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCart([]);
    }
  }, [cart.length]);

  const checkout = useCallback(() => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    let orderSummary = 'Order Summary:\n\n';
    cart.forEach(item => {
      orderSummary += `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    orderSummary += `\nTotal: $${cartTotal.toFixed(2)}`;
    orderSummary += '\n\nThank you for your order! We will contact you soon to confirm your reservation and order details.';

    alert(orderSummary);
    setCart([]);
    setIsCartOpen(false);
  }, [cart, cartTotal]);

  // Carousel controls
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const previousSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Form submission
  const handleFormSubmit = useCallback((event) => {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    event.target.reset();
  }, []);

  // Calculate totals - optimized with useMemo equivalent logic
  const getTotalItems = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Update cart total when cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(total);
  }, [cart]);

  // Keyboard navigation and escape handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        previousSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'Escape' && isCartOpen) {
        toggleCart();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, toggleCart, nextSlide, previousSlide]);

  // Menu data - separated for better maintainability
  const menuData = {
    appetizers: [
      { name: 'Gravlaks', price: 18, description: 'Traditional cured salmon with dill and mustard sauce' },
      { name: 'Reindeer Carpaccio', price: 22, description: 'Thinly sliced reindeer with juniper berries and lingonberry' },
      { name: 'Norwegian Shrimp Salad', price: 16, description: 'Fresh cold-water shrimp with traditional seasonings' }
    ],
    mains: [
      { name: 'Arctic Char', price: 32, description: 'Pan-seared with roasted root vegetables and cloudberry sauce' },
      { name: 'Reindeer Medallions', price: 38, description: 'Our signature dish with wild mushrooms and juniper jus' },
      { name: 'Lamb Fårikål', price: 28, description: 'Traditional Norwegian lamb and cabbage stew' }
    ],
    desserts: [
      { name: 'Krumkake Ice Cream', price: 12, description: 'Vanilla ice cream with traditional Norwegian waffle cone' },
      { name: 'Cloudberry Parfait', price: 14, description: 'Light parfait with Arctic cloudberries and almond crisp' },
      { name: 'Lefse Cake', price: 11, description: 'Traditional layered cake with lingonberry cream' }
    ]
  };

  // Reusable components for better code organization
  const MenuItem = ({ item }) => (
    <div className="menu-item">
      <div className="menu-item-info">
        <h4>{item.name}</h4>
        <p>{item.description}</p>
      </div>
      <div className="menu-item-actions">
        <div className="menu-item-price">${item.price}</div>
        <button
          className="add-to-cart-btn"
          onClick={() => addToCart(item.name, item.price, item.description)}
        >
          <i className="fas fa-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  );

  const CartItem = ({ item }) => (
    <div className="cart-item">
      <div className="cart-item-info">
        <h4>{item.name}</h4>
        <p>{item.description}</p>
        <div className="cart-item-price">${item.price.toFixed(2)} each</div>
      </div>
      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="quantity-btn">-</button>
          <span className="quantity">{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="quantity-btn">+</button>
        </div>
        <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
        <button onClick={() => removeFromCart(item.id)} className="remove-btn">
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );

  return (
    <div className="magnus-restaurant">
      {/* Header */}
      <header>
        <nav>
          <span className="logo-text">Magnus</span>

          <ul className="nav-links">
            <li><button type="button" onClick={() => navigateToSection('home')} className="nav-button">Home</button></li>
            <li><button type="button" onClick={() => navigateToSection('menu')} className="nav-button">Menu</button></li>
            <li><button type="button" onClick={() => navigateToSection('about')} className="nav-button">About</button></li>
            <li><button type="button" onClick={() => navigateToSection('contact')} className="nav-button">Contact</button></li>
          </ul>

          <div className="cart-icon" onClick={toggleCart}>
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-count">{getTotalItems()}</span>
          </div>
        </nav>
      </header>

      {/* Cart Modal */}
      <div className={`cart-modal ${isCartOpen ? 'active' : ''}`} onClick={(e) => e.target.classList.contains('cart-modal') && toggleCart()}>
        <div className="cart-content">
          <div className="cart-header">
            <h2>Your Order</h2>
            <button className="close-cart" onClick={toggleCart}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">Your cart is empty</div>
            ) : (
              cart.map((item) => (
                <CartItem key={item.id} item={item} />
              ))
            )}
          </div>
          <div className="cart-footer">
            <div className="cart-total">
              <strong>Total: ${cartTotal.toFixed(2)}</strong>
            </div>
            <div className="cart-actions">
              <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
              <button className="checkout-btn" onClick={checkout}>Checkout</button>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel - Always visible (Home section) */}
      <div className="carousel-container">
        <div className="carousel-slides" style={{ transform: `translateX(-${currentSlide * (100 / totalSlides)}%)` }}>
          <div className="carousel-slide">
            <img src="/images/blueberry-pie.jpg" alt="Blueberry pie" />
            <div className="carousel-overlay">
              <div className="carousel-content">
                <h2>Authentic Norwegian Cuisine</h2>
                <p>Experience the rich flavors and traditions of Norway in the heart of the city</p>
              </div>
            </div>
          </div>
          <div className="carousel-slide">
            <img src="/images/avacado-toast.jpg" alt="Avocado toast" />
            <div className="carousel-overlay">
              <div className="carousel-content">
                <h2>Fresh Nordic Ingredients</h2>
                <p>Locally sourced ingredients prepared with traditional Norwegian techniques</p>
              </div>
            </div>
          </div>
          <div className="carousel-slide">
            <img src="/images/meatball.jpg" alt="Meatball" />
            <div className="carousel-overlay">
              <div className="carousel-content">
                <h2>Elegant Atmosphere</h2>
                <p>Perfect for intimate dinners and special celebrations</p>
              </div>
            </div>
          </div>
          <div className="carousel-slide">
            <img src="/images/steak.jpg" alt="Steak" />
            <div className="carousel-overlay">
              <div className="carousel-content"></div>
            </div>
          </div>
          <div className="carousel-slide">
            <img src="/images/lamb.jpg" alt="Lamb" />
            <div className="carousel-overlay">
              <div className="carousel-content"></div>
            </div>
          </div>
          <div className="carousel-slide">
            <img src="/images/dessert.jpg" alt="Dessert" />
            <div className="carousel-overlay">
              <div className="carousel-content"></div>
            </div>
          </div>
        </div>
        <button className="carousel-arrow prev" onClick={previousSlide}>‹</button>
        <button className="carousel-arrow next" onClick={nextSlide}>›</button>

        <div className="carousel-indicators">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            ></div>
          ))}
        </div>
      </div>

      <main>
        {/* About Section */}
        <section id="about" className={`section ${activeSection === 'about' ? 'active' : ''}`}>
          <h1>About Magnus</h1>
          <div className="about-content">
            <p>Founded in 1987 by Chef Magnus Eriksson, our restaurant has been bringing authentic Norwegian cuisine
              to the heart of the city for over three decades. Born in the fjords of western Norway, Magnus
              learned traditional cooking techniques from his grandmother, who passed down recipes that had been
              in the family for generations.</p>

            <p>Our story began with a simple dream: to share the warmth and richness of Norwegian hospitality
              through food. From our signature reindeer medallions to our famous cloudberry desserts, every dish
              tells a story of Nordic tradition and innovation. We source our ingredients directly from Norwegian
              suppliers, ensuring that each meal transports you to the breathtaking landscapes of Scandinavia.</p>

            <p>At Magnus, we believe that dining is more than just eating – it's about creating memories,
              celebrating traditions, and bringing people together around the table. Our cozy atmosphere, complete
              with hand-carved wooden furniture and traditional Norwegian textiles, provides the perfect backdrop
              for your culinary journey through Norway.</p>
          </div>
        </section>

        {/* Menu Section */}
        <section id="menu" className={`section ${activeSection === 'menu' ? 'active' : ''}`}>
          <h1>Our Menu</h1>
          <div className="menu-grid">
            <div className="menu-category">
              <h3>Appetizers</h3>
              {menuData.appetizers.map((item, index) => (
                <MenuItem key={index} item={item} />
              ))}
            </div>

            <div className="menu-category">
              <h3>Main Courses</h3>
              {menuData.mains.map((item, index) => (
                <MenuItem key={index} item={item} />
              ))}
            </div>

            <div className="menu-category">
              <h3>Desserts</h3>
              {menuData.desserts.map((item, index) => (
                <MenuItem key={index} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className={`section ${activeSection === 'gallery' ? 'active' : ''}`}>
          <h1>Gallery</h1>
          <div className="gallery-grid">
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop" alt="Restaurant Interior" />
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop" alt="Gourmet Dish" />
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&h=400&fit=crop" alt="Fine Dining" />
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop" alt="Chef Special" />
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop" alt="Dining Room" />
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop" alt="Dessert Plating" />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={`section ${activeSection === 'contact' ? 'active' : ''}`}>
          <h1>Contact Us</h1>
          <div className="contact-content">
            <div className="contact-info">
              <h3>Visit Us</h3>
              <p><strong>Address:</strong><br />
                123 Nordic Avenue<br />
                Oslo District, NY 10001</p>

              <p><strong>Phone:</strong><br />
                (555) 123-4567</p>

              <p><strong>Email:</strong><br />
                info@magnusrestaurant.com</p>

              <div className="map-container">
                <iframe
                  title="Magnus Restaurant Location - Interactive Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.309278362118!2d-74.00425458524631!3d40.74844394335353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1623456789012!5m2!1sen!2sus"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy">
                </iframe>
              </div>
            </div>

            <div className="contact-form">
              <h3>Send us a Message</h3>
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input type="text" id="name" name="name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input type="email" id="email" name="email" required />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea id="message" name="message" required></textarea>
                </div>
                <button type="submit" className="submit-btn">Send Message</button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h3>Magnus Restaurant</h3>
            <p>Authentic Norwegian cuisine in the heart of the city.</p>
            <div className="social-links">
              <a href="https://facebook.com/magnusrestaurant" target="_blank" rel="noopener noreferrer" aria-label="Visit our Facebook page"><i className="fab fa-facebook-f"></i></a>
              <a href="https://instagram.com/magnusrestaurant" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram page"><i className="fab fa-instagram"></i></a>
              <a href="https://twitter.com/magnusrestaurant" target="_blank" rel="noopener noreferrer" aria-label="Visit our Twitter page"><i className="fab fa-twitter"></i></a>
              <a href="https://yelp.com/biz/magnusrestaurant" target="_blank" rel="noopener noreferrer" aria-label="Visit our Yelp page"><i className="fab fa-yelp"></i></a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Business Hours</h3>
            <p><strong>Monday - Thursday:</strong> 5:00 PM - 10:00 PM</p>
            <p><strong>Friday - Saturday:</strong> 5:00 PM - 11:00 PM</p>
            <p><strong>Sunday:</strong> 4:00 PM - 9:00 PM</p>
          </div>

          <div className="footer-section">
            <h3>Contact Info</h3>
            <p>123 Nordic Avenue<br />Oslo District, NY 10001</p>
            <p>Phone: (555) 123-4567</p>
            <p>Email: info@magnusrestaurant.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Magnus Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;