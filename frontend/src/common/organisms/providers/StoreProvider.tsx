"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/common/store";
import type { RootState } from "@/common/store";


export function StoreProvider({
 children,
 initialState,
}:{
 children:React.ReactNode;
 initialState?: Partial<RootState>;
}){

 const [store]=useState(() =>
   makeStore(initialState)
 );


 return (
   <Provider store={store}>
     {children}
   </Provider>
 );
}