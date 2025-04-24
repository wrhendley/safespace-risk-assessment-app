// import { configureStore } from "@reduxjs/toolkit";
// import cartReducer from './features/cartSlice';
// import productsReducer from './features/productsSlice';
// import { saveCartToSession } from "./utilities/sessionStorageUtilities";
// import ordersReducer from './features/ordersSlice';

// export const store = configureStore({
//     reducer:{
//         cart: cartReducer, 
//         products: productsReducer,
//         orders: ordersReducer,
//     }, 
// });

// store.subscribe(() => {
//     const state = store.getState();
//     saveCartToSession(state.cart);
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export default store;
