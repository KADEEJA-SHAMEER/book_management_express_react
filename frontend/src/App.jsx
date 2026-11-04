import AddData  from './components/Addbook';
import Register from './components/Register';
import Login from './components/Login';
import ViewBooks from './components/ViewBook';
import BookDetails from './components/BookDetails';
import UpdateBook from './components/UpdateBook';
import {BrowserRouter,Routes,Route} from "react-router-dom"
import './App.css'

function App() {
 

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<AddData/>}></Route>
      <Route path="/register" element={<Register/>}></Route>
      <Route path="/login" element={<Login/>}></Route>
      <Route path="/book/:id" element={<BookDetails />} />
      <Route path="/edit-book/:id" element={<UpdateBook />} />
      <Route path="/books" element={<ViewBooks />} />
    </Routes>
    </BrowserRouter>
     
    </>
  )
}

export default App
