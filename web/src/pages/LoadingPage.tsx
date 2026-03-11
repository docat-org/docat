import React from 'react'
import Footer from '../components/Footer'
import Header from '../components/Header'

export default function LoadingPage(): React.JSX.Element {
  return (
    <>
      <Header />
      <div className="loading-spinner"></div>
      <Footer />
    </>
  )
}
