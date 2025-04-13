const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header and Footer removed to avoid duplicates - they are already included in App.jsx */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  )
}

export default Layout