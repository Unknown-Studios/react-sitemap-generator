import React from 'react'
import { Routes, Route } from 'react-router'

export const routes = () => {
  return (
    <Routes>
      <Route path="/hello"></Route>
    </Routes>
  )
}

export const moreRoutes = () => {
  return (
    <Routes>
      <Route path="/hello"></Route>
      <Route path="/test"></Route>
      <Route path="/heythere/:id"></Route>
      <Route path="/cake/:id/test"></Route>
      <Route path="/pizza/:id/:test"></Route>
    </Routes>
  )
}
