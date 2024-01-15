// import React, { useEffect, useState } from "react";

// import { useSelector, useDispatch } from "react-redux";
// import {
//   fetchLoggedInUserAsync,
//   fetchLoggedInUserOrderAsync,
//   selectUserInfo,
//   selectUserInfoStatus,
//   selectUserOrders,
// } from "../userSlice";
// import {
//   PencilIcon,
//   EyeIcon,
//   ArrowUpIcon,
//   ArrowDownIcon,
// } from "@heroicons/react/24/outline";
// import { Grid } from "react-loader-spinner";
// import { fetchLoggedInUser } from "../userAPI";
// import { updateOrderAsync } from "../../order/orderSlice";
// export default function UserOrders() {
//   const dispatch = useDispatch();
//   const orders = useSelector(selectUserOrders);
//   const status = useSelector(selectUserInfoStatus);
//   const [editableOrderId, setEditableOrderId] = useState(-1);
//   const userInfo = useSelector(selectUserInfo);

//   useEffect(() => {
//     dispatch(fetchLoggedInUserOrderAsync());
//   }, [dispatch]);

//   const chooseColor = (status) => {
//     switch (status) {
//       case "pending":
//         return "bg-purple-200 text-purple-600";
//       case "dispatched":
//         return "bg-yellow-200 text-yellow-600";
//       case "delivered":
//         return "bg-green-200 text-green-600";
//       case "received":
//         return "bg-green-200 text-green-600";
//       case "cancelled":
//         return "bg-red-200 text-red-600";
//       default:
//         return "bg-purple-200 text-purple-600";
//     }
//   };

//   const handleEdit = (order) => {
//     setEditableOrderId(order.id);
//   };

//   const handleOrderStatus = (e, order) => {
//     const updatedOrder = { ...order, status: e.target.value };
//     dispatch(updateOrderAsync(updatedOrder));
//     setEditableOrderId(-1);
//   };

//   return (
//     <div>
//       {orders &&
//         orders.map((order) => (
//           <div key={order.id}>
//             <div>
//               <div className="mx-auto mt-12 bg-white max-w-7xl px-4 sm:px-6 lg:px-8">
//                 <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
//                   <h1 className="text-4xl my-5 font-bold tracking-tight text-gray-900">
//                     Order # {order.id}
//                   </h1>

//                   <h3 className="text-xl my-5 font-bold tracking-tight text-red-900">
//                     Order Status : {order.status}
//                   </h3>

//                   <div className="flow-root">
//                     <ul className="-my-6 divide-y divide-gray-200">
//                       {order.items.map((item) => (
//                         <li key={item.id} className="flex py-6">
//                           <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
//                             <img
//                               src={item.product.thumbnail}
//                               alt={item.product.title}
//                               className="h-full w-full object-cover object-center"
//                             />
//                           </div>

//                           <div className="ml-4 flex flex-1 flex-col">
//                             <div>
//                               <div className="flex justify-between text-base font-medium text-gray-900">
//                                 <h3>
//                                   <a href={item.product.id}>
//                                     {item.product.title}
//                                   </a>
//                                 </h3>
//                                 <td className="py-3 px-0 text-center">
//                                   {order.id === editableOrderId ? (
//                                     <select
//                                       onChange={(e) =>
//                                         handleOrderStatus(e, order)
//                                       }
//                                     >
//                                       <option value="pending">Pending</option>
//                                       <option value="dispatched">
//                                         Dispatched
//                                       </option>
//                                       <option value="delivered">
//                                         Delivered
//                                       </option>
//                                       <option value="cancelled">
//                                         Cancelled
//                                       </option>
//                                     </select>
//                                   ) : (
//                                     <span
//                                       className={`${chooseColor(
//                                         order.status
//                                       )} py-1 px-3 rounded-full text-xs`}
//                                     >
//                                       {order.status}
//                                     </span>
//                                   )}
//                                 </td>
//                                 <p className="ml-4">
//                                   ${item.product.discountPrice}
//                                 </p>
//                               </div>
//                               <p className="mt-1 text-sm text-gray-500">
//                                 {item.product.brand}
//                               </p>
//                             </div>
//                             <div className="flex flex-1 items-end justify-between text-sm">
//                               <div className="text-gray-500">
//                                 <label
//                                   htmlFor="quantity"
//                                   className="inline mr-5 text-sm font-medium leading-6 text-gray-900"
//                                 >
//                                   Qty :{item.quantity}
//                                 </label>
//                               </div>

//                               <div className="flex"></div>
//                             </div>
//                           </div>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
//                   <div className="flex justify-between my-2 text-base font-medium text-gray-900">
//                     <p>Subtotal</p>
//                     <p>$ {order.totalAmount}</p>
//                   </div>
//                   <div className="flex justify-between my-2 text-base font-medium text-gray-900">
//                     <p>Total Items in Cart</p>
//                     <p>{order.totalItems} items</p>
//                   </div>
//                   <p className="mt-0.5 text-sm text-gray-500">
//                     Shipping Address :
//                   </p>
//                   <div className="flex justify-between gap-x-6 px-5 py-5 border-solid border-2 border-gray-200">
//                     <div className="flex gap-x-4">
//                       <div className="min-w-0 flex-auto">
//                         <p className="text-sm font-semibold leading-6 text-gray-900">
//                           {order.selectedAddress.name}
//                         </p>
//                         <p className="mt-1 truncate text-xs leading-5 text-gray-500">
//                           {order.selectedAddress.street}
//                         </p>
//                         <p className="mt-1 truncate text-xs leading-5 text-gray-500">
//                           {order.selectedAddress.pinCode}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="hidden sm:flex sm:flex-col sm:items-end">
//                       <p className="text-sm leading-6 text-gray-900">
//                         Phone: {order.selectedAddress.phone}
//                       </p>
//                       <p className="text-sm leading-6 text-gray-500">
//                         {order.selectedAddress.city}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       {status === "loading" ? (
//         <Grid
//           height="80"
//           width="80"
//           color="rgb(79, 70, 229) "
//           ariaLabel="grid-loading"
//           radius="12.5"
//           wrapperStyle={{}}
//           wrapperClass=""
//           visible={true}
//         />
//       ) : null}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { ITEMS_PER_PAGE } from "../../../app/constants";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllOrdersAsync,
  selectOrders,
  selectTotalOrders,
  updateOrderAsync,
} from "../../order/orderSlice";
import {
  PencilIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import Pagination from "../../common/Pagination";

function UserOrders() {
  const [page, setPage] = useState(1);
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders);
  const totalOrders = useSelector(selectTotalOrders);
  const [editableOrderId, setEditableOrderId] = useState(-1);
  const [sort, setSort] = useState({});

  const handleEdit = (order) => {
    setEditableOrderId(order.id);
  };
  const handleShow = () => {
    console.log("handleShow");
  };

  const handleOrderStatus = (e, order) => {
    const updatedOrder = { ...order, status: e.target.value };
    dispatch(updateOrderAsync(updatedOrder));
    setEditableOrderId(-1);
  };

  const handleOrderPaymentStatus = (e, order) => {
    const updatedOrder = { ...order, paymentStatus: e.target.value };
    dispatch(updateOrderAsync(updatedOrder));
    setEditableOrderId(-1);
  };

  const handlePage = (page) => {
    setPage(page);
  };

  const handleSort = (sortOption) => {
    const sort = { _sort: sortOption.sort, _order: sortOption.order };
    console.log({ sort });
    setSort(sort);
  };

  const chooseColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-purple-200 text-purple-600";
      case "dispatched":
        return "bg-yellow-200 text-yellow-600";
      case "delivered":
        return "bg-green-200 text-green-600";
      case "received":
        return "bg-green-200 text-green-600";
      case "cancelled":
        return "bg-red-200 text-red-600";
      default:
        return "bg-purple-200 text-purple-600";
    }
  };

  useEffect(() => {
    const pagination = { _page: page, _limit: ITEMS_PER_PAGE };
    dispatch(fetchAllOrdersAsync({ sort, pagination }));
  }, [dispatch, page, sort]);

  return (
    <div className="overflow-x-auto">
      <div className="bg-gray-100 flex items-center justify-center font-sans overflow-hidden">
        <div className="w-full">
          <div className="bg-white shadow-md rounded my-6">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th
                    className="py-3 px-0 text-left cursor-pointer"
                    onClick={(e) =>
                      handleSort({
                        sort: "id",
                        order: sort?._order === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    Order#{" "}
                    {sort._sort === "id" &&
                      (sort._order === "asc" ? (
                        <ArrowUpIcon className="w-4 h-4 inline"></ArrowUpIcon>
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 inline"></ArrowDownIcon>
                      ))}
                  </th>
                  <th className="py-3 px-0 text-left">Items</th>
                  <th
                    className="py-3 px-0 text-left cursor-pointer"
                    onClick={(e) =>
                      handleSort({
                        sort: "totalAmount",
                        order: sort?._order === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    Total Amount{" "}
                    {sort._sort === "totalAmount" &&
                      (sort._order === "asc" ? (
                        <ArrowUpIcon className="w-4 h-4 inline"></ArrowUpIcon>
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 inline"></ArrowDownIcon>
                      ))}
                  </th>
                  <th className="py-3 px-0 text-center">Shipping Address</th>
                  <th className="py-3 px-0 text-center">Order Status</th>
                  <th className="py-3 px-0 text-center">Payment Method</th>
                  <th className="py-3 px-0 text-center">Payment Status</th>
                  <th
                    className="py-3 px-0 text-left cursor-pointer"
                    onClick={(e) =>
                      handleSort({
                        sort: "createdAt",
                        order: sort?._order === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    Order Time{" "}
                    {sort._sort === "createdAt" &&
                      (sort._order === "asc" ? (
                        <ArrowUpIcon className="w-4 h-4 inline"></ArrowUpIcon>
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 inline"></ArrowDownIcon>
                      ))}
                  </th>
                  <th
                    className="py-3 px-0 text-left cursor-pointer"
                    onClick={(e) =>
                      handleSort({
                        sort: "updatedAt",
                        order: sort?._order === "asc" ? "desc" : "asc",
                      })
                    }
                  >
                    Last Updated{" "}
                    {sort._sort === "updatedAt" &&
                      (sort._order === "asc" ? (
                        <ArrowUpIcon className="w-4 h-4 inline"></ArrowUpIcon>
                      ) : (
                        <ArrowDownIcon className="w-4 h-4 inline"></ArrowDownIcon>
                      ))}
                  </th>
                  <th className="py-3 px-0 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-0 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2"></div>
                        <span className="font-medium">{order.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-0 text-left">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="mr-2">
                            <img
                              className="w-6 h-6 rounded-full"
                              src={item.product.thumbnail}
                              alt={item.product.title}
                            />
                          </div>
                          <span>
                            {item.product.title} - #{item.quantity} - $
                            {item.product.discountPrice}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-0 text-center">
                      <div className="flex items-center justify-center">
                        ${order.totalAmount}
                      </div>
                    </td>
                    <td className="py-3 px-0 text-center">
                      <div className="">
                        <div>
                          <strong>{order.selectedAddress.name}</strong>,
                        </div>
                        <div>{order.selectedAddress.street},</div>
                        <div>{order.selectedAddress.city}, </div>
                        <div>{order.selectedAddress.state}, </div>
                        <div>{order.selectedAddress.pinCode}, </div>
                        <div>{order.selectedAddress.phone}, </div>
                      </div>
                    </td>
                    <td className="py-3 px-0 text-center">
                      {order.id === editableOrderId ? (
                        <button
                          className="bg-red-600 rounded-full text-white p-2 px-3"
                          value="cancelled"
                          onClick={(e) => handleOrderStatus(e, order)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span
                          className={`${chooseColor(
                            order.status
                          )} py-1 px-3 rounded-full text-xs`}
                        >
                          {order.status}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-0 text-center">
                      <div className="flex items-center justify-center">
                        {order.paymentMethod}
                      </div>
                    </td>

                    <td className="py-3 px-0 text-center">
                      {order.id === editableOrderId ? (
                        <span
                          className={`${chooseColor(
                            order.paymentStatus
                          )} py-1 px-3 rounded-full text-xs`}
                        >
                          {order.paymentStatus}
                        </span>
                      ) : (
                        <span
                          className={`${chooseColor(
                            order.paymentStatus
                          )} py-1 px-3 rounded-full text-xs`}
                        >
                          {order.paymentStatus}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-0 text-center">
                      <div className="flex items-center justify-center">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : null}
                      </div>
                    </td>

                    <td className="py-3 px-0 text-center">
                      <div className="flex items-center justify-center">
                        {order.updatedAt
                          ? new Date(order.updatedAt).toLocaleString()
                          : null}
                      </div>
                    </td>

                    <td className="py-3 px-0 text-center">
                      <div className="flex item-center justify-center">
                        {order.status !== "cancelled" &&
                        order.status !== "delivered" ? (
                          <div className="w-6 mr-2 transform hover:text-purple-500 hover:scale-120">
                            <PencilIcon
                              className="w-8 h-8"
                              onClick={(e) => handleEdit(order)}
                            ></PencilIcon>
                          </div>
                        ) : (
                          <p className="m-2 text-red-600">
                            Order cannot be cancelled
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Pagination
        page={page}
        setPage={setPage}
        handlePage={handlePage}
        totalItems={totalOrders}
      ></Pagination>
    </div>
  );
}

export default UserOrders;
