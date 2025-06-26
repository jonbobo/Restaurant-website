import React, { useState, useEffect, useCallback } from 'react';

const App = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalSlides = 6;

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Navigation functionality
  const navigateToSection = useCallback((sectionId) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerHeight = 160;
        const elementPosition = element.offsetTop - headerHeight;
        window.scrollTo({ top: elementPosition, behavior: 'smooth' });
      }
    }, 50);
  }, []);

  // Cart functions
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
          id: Date.now(),
          name,
          price,
          description,
          quantity: 1
        }];
      }
    });

    // Show notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 right-5 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-2 transform translate-x-full transition-transform duration-300';
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      <span>${name} added to cart!</span>
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.remove('translate-x-full');
    });

    setTimeout(() => {
      notification.classList.add('translate-x-full');
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

  // Calculate totals
  const getTotalItems = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Update cart total when cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(total);
  }, [cart]);

  // Keyboard navigation
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

  // Menu data
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

  // Components
  const MenuItem = ({ item }) => (
    <div className="flex flex-col justify-between h-full mb-6 p-4 rounded-lg transition-all duration-300 hover:bg-orange-50">
      <div className="flex-1 mb-4">
        <h4 className="text-gray-800 mb-2 text-xl font-semibold">{item.name}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        <div className="text-orange-500 font-bold text-xl mt-3">${item.price}</div>
      </div>
      <button
        className="w-full bg-orange-500 text-white px-4 py-3 rounded-full text-sm transition-all duration-300 hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
        onClick={() => addToCart(item.name, item.price, item.description)}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add to Cart
      </button>
    </div>
  );

  const CartItem = ({ item }) => (
    <div className="flex justify-between items-start p-4 border-b border-gray-200 transition-colors duration-300 hover:bg-gray-50 last:border-b-0">
      <div className="flex-1 mr-4">
        <h4 className="text-gray-800 mb-2 text-lg">{item.name}</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        <div className="text-orange-500 font-bold mt-2">${item.price.toFixed(2)} each</div>
      </div>
      <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-4">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-base transition-colors duration-300 hover:bg-orange-600"
          >
            -
          </button>
          <span className="font-bold px-3 py-1 min-w-8 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-base transition-colors duration-300 hover:bg-orange-600"
          >
            +
          </button>
        </div>
        <div className="font-bold text-orange-500 text-lg">${(item.price * item.quantity).toFixed(2)}</div>
        <button
          onClick={() => removeFromCart(item.id)}
          className="bg-red-500 text-white px-3 py-2 rounded transition-colors duration-300 hover:bg-red-600"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="font-serif text-gray-800 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white text-white py-8 fixed w-full top-0 z-50 shadow-lg">
        <nav className="flex justify-between items-center max-w-7xl mx-auto px-4">
          <span className="text-6xl font-bold text-orange-500 md:text-4xl">Magnus</span>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex list-none gap-16 text-2xl">
            <li><button type="button" onClick={() => navigateToSection('home')} className="text-black hover:text-yellow-600 transition-colors duration-300 font-medium cursor-pointer bg-transparent border-none text-2xl font-serif p-0">Home</button></li>
            <li><button type="button" onClick={() => navigateToSection('menu')} className="text-black hover:text-yellow-600 transition-colors duration-300 font-medium cursor-pointer bg-transparent border-none text-2xl font-serif p-0">Menu</button></li>
            <li><button type="button" onClick={() => navigateToSection('about')} className="text-black hover:text-yellow-600 transition-colors duration-300 font-medium cursor-pointer bg-transparent border-none text-2xl font-serif p-0">About</button></li>
            <li><button type="button" onClick={() => navigateToSection('contact')} className="text-black hover:text-yellow-600 transition-colors duration-300 font-medium cursor-pointer bg-transparent border-none text-2xl font-serif p-0">Contact</button></li>
          </ul>

          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <div className="relative cursor-pointer p-2 text-orange-500 text-2xl transition-colors duration-300 hover:text-orange-600" onClick={toggleCart}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold min-w-5">
                {getTotalItems()}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden flex flex-col gap-1 cursor-pointer p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className={`w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-6 h-0.5 bg-gray-800 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200">
            <ul className="flex flex-col">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToSection('home')}
                  className="w-full text-left px-6 py-4 text-black hover:text-orange-500 hover:bg-orange-50 transition-all duration-300 font-medium border-b border-gray-100 bg-transparent border-none text-lg font-serif"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToSection('menu')}
                  className="w-full text-left px-6 py-4 text-black hover:text-orange-500 hover:bg-orange-50 transition-all duration-300 font-medium border-b border-gray-100 bg-transparent border-none text-lg font-serif"
                >
                  Menu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToSection('about')}
                  className="w-full text-left px-6 py-4 text-black hover:text-orange-500 hover:bg-orange-50 transition-all duration-300 font-medium border-b border-gray-100 bg-transparent border-none text-lg font-serif"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToSection('contact')}
                  className="w-full text-left px-6 py-4 text-black hover:text-orange-500 hover:bg-orange-50 transition-all duration-300 font-medium bg-transparent border-none text-lg font-serif"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && toggleCart()}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-11/12 max-h-4/5 overflow-hidden flex flex-col animate-in slide-in-from-top-12 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-orange-500 text-white">
              <h2 className="text-2xl font-bold">Your Order</h2>
              <button className="bg-transparent border-none text-white text-2xl cursor-pointer p-2 rounded-full transition-colors duration-300 hover:bg-white hover:bg-opacity-20" onClick={toggleCart}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 max-h-96">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-600 italic">Your cart is empty</div>
              ) : (
                cart.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-center mb-4 text-xl text-gray-800">
                <strong>Total: ${cartTotal.toFixed(2)}</strong>
              </div>
              <div className="flex gap-4 justify-center flex-col md:flex-row">
                <button className="px-6 py-3 border-none rounded-lg text-base cursor-pointer font-medium transition-all duration-300 bg-gray-400 text-white hover:bg-gray-500" onClick={clearCart}>Clear Cart</button>
                <button className="px-6 py-3 border-none rounded-lg text-base cursor-pointer font-medium transition-all duration-300 bg-green-600 text-white hover:bg-green-700 hover:-translate-y-0.5" onClick={checkout}>Checkout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carousel */}
      <div className="relative w-full h-screen mt-20 overflow-hidden">
        <div className="flex w-full h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`, width: '600%' }}>
          {[
            { src: "/images/blueberry-pie.jpg", alt: "Blueberry pie", title: "Authentic Norwegian Cuisine", desc: "Experience the rich flavors and traditions of Norway in the heart of the city" },
            { src: "/images/avacado-toast.jpg", alt: "Avocado toast", title: "Fresh Nordic Ingredients", desc: "Locally sourced ingredients prepared with traditional Norwegian techniques" },
            { src: "/images/meatball.jpg", alt: "Meatball", title: "Elegant Atmosphere", desc: "Perfect for intimate dinners and special celebrations" },
            { src: "/images/steak.jpg", alt: "Steak" },
            { src: "/images/lamb.jpg", alt: "Lamb" },
            { src: "/images/dessert.jpg", alt: "Dessert" }
          ].map((slide, index) => (
            <div key={index} className="w-1/6 h-full relative flex-shrink-0">
              <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/10 flex items-center justify-center text-white text-center">
                <div className="max-w-4xl mx-auto px-8">
                  {slide.title && (
                    <>
                      <h2 className="text-5xl md:text-6xl mb-4 font-bold text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                        {slide.title}
                      </h2>
                      <p className="text-xl md:text-2xl text-center mx-auto" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                        {slide.desc}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="absolute top-1/2 left-8 transform -translate-y-1/2 bg-white/90 border-none w-15 h-15 rounded-full cursor-pointer text-2xl text-gray-800 transition-all duration-300 hover:bg-white hover:scale-110 hover:shadow-xl z-10 flex items-center justify-center shadow-lg" onClick={previousSlide}>
          ‹
        </button>
        <button className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-white/90 border-none w-15 h-15 rounded-full cursor-pointer text-2xl text-gray-800 transition-all duration-300 hover:bg-white hover:scale-110 hover:shadow-xl z-10 flex items-center justify-center shadow-lg" onClick={nextSlide}>
          ›
        </button>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              onClick={() => goToSlide(index)}
            ></div>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 py-16">
        {/* About Section */}
        <section id="about" className={`mb-24 ${activeSection === 'about' ? 'block' : 'hidden'}`}>
          <h1 className="text-orange-500 mb-8 text-center text-5xl font-bold">About Magnus</h1>
          <div className="text-xl text-center max-w-4xl mx-auto leading-relaxed">
            <p className="mb-8">
              Founded in 1987 by Chef Magnus Eriksson, our restaurant has been bringing authentic Norwegian cuisine
              to the heart of the city for over three decades. Born in the fjords of western Norway, Magnus
              learned traditional cooking techniques from his grandmother, who passed down recipes that had been
              in the family for generations.
            </p>

            <p className="mb-8">
              Our story began with a simple dream: to share the warmth and richness of Norwegian hospitality
              through food. From our signature reindeer medallions to our famous cloudberry desserts, every dish
              tells a story of Nordic tradition and innovation. We source our ingredients directly from Norwegian
              suppliers, ensuring that each meal transports you to the breathtaking landscapes of Scandinavia.
            </p>

            <p>
              At Magnus, we believe that dining is more than just eating – it's about creating memories,
              celebrating traditions, and bringing people together around the table. Our cozy atmosphere, complete
              with hand-carved wooden furniture and traditional Norwegian textiles, provides the perfect backdrop
              for your culinary journey through Norway.
            </p>
          </div>
        </section>

        {/* Menu Section */}
        <section id="menu" className={`mb-24 ${activeSection === 'menu' ? 'block' : 'hidden'}`}>
          <h1 className="text-orange-500 mb-8 text-center text-5xl font-bold">Our Menu</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
            <div className="bg-gray-50 p-8 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <h3 className="text-orange-500 text-3xl mb-6 text-center relative font-bold">
                Appetizers
                <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-12 h-1 bg-orange-500 rounded"></div>
              </h3>
              <div className="flex flex-col gap-4">
                {menuData.appetizers.map((item, index) => (
                  <MenuItem key={index} item={item} />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <h3 className="text-orange-500 text-3xl mb-6 text-center relative font-bold">
                Main Courses
                <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-12 h-1 bg-orange-500 rounded"></div>
              </h3>
              <div className="flex flex-col gap-4">
                {menuData.mains.map((item, index) => (
                  <MenuItem key={index} item={item} />
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <h3 className="text-orange-500 text-3xl mb-6 text-center relative font-bold">
                Desserts
                <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-12 h-1 bg-orange-500 rounded"></div>
              </h3>
              <div className="flex flex-col gap-4">
                {menuData.desserts.map((item, index) => (
                  <MenuItem key={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className={`mb-24 ${activeSection === 'gallery' ? 'block' : 'hidden'}`}>
          <h1 className="text-orange-500 mb-8 text-center text-5xl font-bold">Gallery</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {[
              { src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop", alt: "Restaurant Interior" },
              { src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop", alt: "Gourmet Dish" },
              { src: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&h=400&fit=crop", alt: "Fine Dining" },
              { src: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop", alt: "Chef Special" },
              { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop", alt: "Dining Room" },
              { src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=400&fit=crop", alt: "Dessert Plating" }
            ].map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <img src={image.src} alt={image.alt} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className={`mb-24 ${activeSection === 'contact' ? 'block' : 'hidden'}`}>
          <h1 className="text-orange-500 mb-8 text-center text-5xl font-bold">Contact Us</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mt-12">
            <div className="bg-gray-50 p-10 rounded-2xl shadow-lg">
              <h3 className="text-orange-500 mb-6 text-2xl font-bold">Visit Us</h3>
              <p className="mb-6 leading-relaxed">
                <strong>Address:</strong><br />
                123 Nordic Avenue<br />
                Oslo District, NY 10001
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>Phone:</strong><br />
                (555) 123-4567
              </p>

              <p className="mb-6 leading-relaxed">
                <strong>Email:</strong><br />
                info@magnusrestaurant.com
              </p>

              <div className="w-full h-75 rounded-lg overflow-hidden mt-8 shadow-lg">
                <iframe
                  title="Magnus Restaurant Location - Interactive Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.309278362118!2d-74.00425458524631!3d40.74844394335353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1623456789012!5m2!1sen!2sus"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy">
                </iframe>
              </div>
            </div>

            <div className="bg-gray-50 p-10 rounded-2xl shadow-lg">
              <h3 className="text-orange-500 mb-6 text-2xl font-bold">Send us a Message</h3>
              <form onSubmit={handleFormSubmit}>
                <div className="mb-6">
                  <label htmlFor="name" className="block mb-2 text-gray-800 font-medium">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-orange-500 focus:shadow-lg focus:shadow-orange-100"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="email" className="block mb-2 text-gray-800 font-medium">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-orange-500 focus:shadow-lg focus:shadow-orange-100"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block mb-2 text-gray-800 font-medium">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base h-32 resize-y transition-all duration-300 focus:outline-none focus:border-orange-500 focus:shadow-lg focus:shadow-orange-100"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-8 py-4 border-none rounded-lg text-lg cursor-pointer transition-all duration-300 font-medium hover:bg-orange-600 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-200"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12 text-center">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center md:text-left">
            <h3 className="text-orange-500 mb-4 text-xl font-bold">Magnus Restaurant</h3>
            <p className="mb-4 leading-relaxed">Authentic Norwegian cuisine in the heart of the city.</p>
            <div className="flex justify-center md:justify-start gap-4 mt-4">
              <a href="https://facebook.com/magnusrestaurant" target="_blank" rel="noopener noreferrer" aria-label="Visit our Facebook page" className="text-white text-2xl hover:text-orange-500 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-100 hover:bg-opacity-10 p-2 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://instagram.com/magnusrestaurant" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram page" className="text-white text-2xl hover:text-orange-500 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-100 hover:bg-opacity-10 p-2 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.32-1.291C3.858 14.498 3.858 12.948 5.129 11.677c1.271-1.271 2.821-1.271 4.092 0 1.271 1.271 1.271 2.821 0 4.092-.871.801-2.023 1.219-3.32 1.219z" />
                </svg>
              </a>
              <a href="https://twitter.com/magnusrestaurant" target="_blank" rel="noopener noreferrer" aria-label="Visit our Twitter page" className="text-white text-2xl hover:text-orange-500 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-100 hover:bg-opacity-10 p-2 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="https://yelp.com/biz/magnusrestaurant" target="_blank" rel="noopener noreferrer" aria-label="Visit our Yelp page" className="text-white text-2xl hover:text-orange-500 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-100 hover:bg-opacity-10 p-2 rounded-full">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.014 5.367 18.647.001 12.017.001z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-orange-500 mb-4 text-xl font-bold">Business Hours</h3>
            <p className="mb-2 leading-relaxed"><strong>Monday - Thursday:</strong> 5:00 PM - 10:00 PM</p>
            <p className="mb-2 leading-relaxed"><strong>Friday - Saturday:</strong> 5:00 PM - 11:00 PM</p>
            <p className="leading-relaxed"><strong>Sunday:</strong> 4:00 PM - 9:00 PM</p>
          </div>

          <div className="text-center md:text-right">
            <h3 className="text-orange-500 mb-4 text-xl font-bold">Contact Info</h3>
            <p className="mb-2 leading-relaxed">123 Nordic Avenue<br />Oslo District, NY 10001</p>
            <p className="mb-2 leading-relaxed">Phone: (555) 123-4567</p>
            <p className="leading-relaxed">Email: info@magnusrestaurant.com</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-600">
          <p>&copy; 2025 Magnus Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;