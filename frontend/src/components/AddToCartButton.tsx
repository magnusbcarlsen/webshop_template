// import React from "react";
// import { toast } from "react-toastify";

// interface AddToCartButtonProps {
//   productId: number;
//   quantity?: number;
//   className?: string;
// }

// export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
//     productId,
//     quantity = 1,
//     className = "bg-blue-500 text-white px-4 py-2 rounded",
//     }) => {
//         const handleAdd = async () => {
//             try {
//               const response = await fetch('/carts/items', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ productId, quantity }),
//               });

//               if (!response.ok) throw new Error('Failed to add to cart');
//               toast.success('Added to cart');
//             } catch (err: unknown) {
//               console.error(err);
//               toast.error(err instanceof Error ? err.message : 'Error adding to cart');
//             }
//           };

//     return (
//         <button className={className} onClick={handleAdd}>
//         Add to Cart
//         </button>
//     );
// }
