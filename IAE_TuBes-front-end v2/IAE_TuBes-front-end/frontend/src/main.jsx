import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 
import { BrowserRouter } from 'react-router-dom'  // <--- WAJIB ADA
import { ApolloProvider } from '@apollo/client'
import client from './apollo.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>  {/* <--- WAJIB MEMBUNGKUS APP */}
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
)