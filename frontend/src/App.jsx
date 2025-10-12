import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AddItem from "./pages/AddItem";
import ItemDetail from "./pages/ItemDetail";
import Footer from "./components/Footer";
import EditItem from "./pages/EditItem";
// import MessagesTab from "./pages/MessagesTab";
import Inbox from "./pages/Inbox";
import 'bootstrap-icons/font/bootstrap-icons.css';


// ✅ Import SearchProvider
// import { SearchProvider } from "./context/SearchContext";

function App() {
  return (
    <Router>
     
        <div id="app-layout" className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/add" element={<AddItem />} />
              <Route path="/item/:id" element={<ItemDetail />} />
               <Route path="/inbox" element={<Inbox />} />
              <Route path="/edit-item/:id" element={<EditItem />} />
            </Routes>
          </main>
          <Footer />
        </div>
      
    </Router>
  );
}

export default App;
