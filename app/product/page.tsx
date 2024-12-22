"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
  content: string;
}

const Page = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputName, setInputName] = useState("");
  const [inputPrice, setInputPrice] = useState<number>(0);
  const [inputContent, setInputContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingContent, setEditingContent] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchProducts().then(() => setLoading(false));
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/product");
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch products.",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    if (inputName.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Please enter a product name.",
        variant: "destructive",
      });
      return;
    }

    if (inputPrice < 0) {
      toast({
        title: "Validation Error",
        description: "Price cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    if (inputContent.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Please enter product content.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inputName.trim(),
          price: inputPrice,
          content: inputContent.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add product");
      }

      const newProduct: Product = await res.json();
      setProducts([newProduct, ...products]);
      setInputName("");
      setInputPrice(0);
      setInputContent("");

      toast({
        title: "Success",
        description: `${newProduct.name} has been added.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setEditingName(product.name);
    setEditingPrice(product.price);
    setEditingContent(product.content);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch("/api/product", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      setProducts(products.filter((product) => product._id !== id));

      toast({
        title: "Deleted",
        description: "Product has been deleted.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    if (editingName.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Product name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (editingPrice < 0) {
      toast({
        title: "Validation Error",
        description: "Price cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    if (editingContent.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Product content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/product", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct._id,
          name: editingName.trim(),
          price: editingPrice,
          content: editingContent.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      const updatedProduct: Product = await res.json();
      setProducts(
        products.map((product) =>
          product._id === updatedProduct._id ? updatedProduct : product
        )
      );
      setIsDialogOpen(false);
      setEditingProduct(null);
      setEditingName("");
      setEditingPrice(0);
      setEditingContent("");

      toast({
        title: "Success",
        description: `${updatedProduct.name} has been updated.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="p-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="p-8">
        {/* Input Section - Updated with grid layout */}
        <div className="flex items-center gap-4">
          <div className="flex-1 grid grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Enter a product name"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Enter price"
              value={inputPrice}
              onChange={(e) => setInputPrice(parseFloat(e.target.value))}
              min="0"
              step="0.01"
            />
            <Input
              type="text"
              placeholder="Enter product content"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
            />
          </div>
          <Button onClick={handleAddProduct}>Add</Button>
        </div>

        {/* Display Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="p-4 border rounded-md shadow-md flex flex-col justify-between"
            >
              <div
                className="cursor-pointer"
                onClick={() => handleEditClick(product)}
              >
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">Price: ${product.price}</p>
                <p className="text-sm text-gray-600">{product.content}</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleDelete(product._id)}
                className="mt-4"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && editingProduct && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Edit product name"
              />
              <Input
                type="number"
                value={editingPrice}
                onChange={(e) => setEditingPrice(parseFloat(e.target.value))}
                placeholder="Edit price"
                min="0"
                step="0.01"
              />
              <Input
                type="text"
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                placeholder="Edit product content"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Page;