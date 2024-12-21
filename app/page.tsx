// app/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar/page";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface City {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
}

interface Item {
  city: string;
  products: string[];
}

const Page = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingProducts, setEditingProducts] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [errorCities, setErrorCities] = useState<string | null>(null);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  // Fetch cities from the API
  useEffect(() => {
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch("/api/city");
        if (!response.ok) {
          throw new Error("Failed to fetch cities");
        }
        const data: City[] = await response.json();
        setCities(data);
        setErrorCities(null);
      } catch (err: any) {
        console.error("Error fetching cities:", err);
        setErrorCities(err.message || "An error occurred");
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch("/api/product");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data: Product[] = await response.json();
        setProducts(data);
        setErrorProducts(null);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setErrorProducts(err.message || "An error occurred");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddItem = () => {
    if (selectedCity && selectedProduct) {
      const existingItemIndex = items.findIndex(
        (item) => item.city === selectedCity
      );
      if (existingItemIndex !== -1) {
        const updatedItems = [...items];
        if (!updatedItems[existingItemIndex].products.includes(selectedProduct)) {
          updatedItems[existingItemIndex].products.push(selectedProduct);
          setItems(updatedItems);
        } else {
          alert("Product already added to this city!");
        }
      } else {
        setItems([...items, { city: selectedCity, products: [selectedProduct] }]);
      }
      setSelectedCity("");
      setSelectedProduct("");
    } else {
      alert("Please select both a city and a product!");
    }
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setEditingProducts(items[index]?.products || []);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const updatedItems = [...items];
    if (editingProducts.length > 0) {
      updatedItems[editingIndex] = {
        ...updatedItems[editingIndex],
        products: editingProducts,
      };
    } else {
      updatedItems.splice(editingIndex, 1); // Remove item if all products are deleted
    }
    setItems(updatedItems);
    setIsDialogOpen(false);
    setEditingIndex(null);
    setEditingProducts([]);
  };

  return (
    <div>
      <Navbar />

      {/* Centered Input Section */}
      <div className="flex flex-col items-center justify-center mt-10">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-center">
          {/* City Selector */}
          <div className="w-full sm:w-auto">
            <Select onValueChange={setSelectedCity} value={selectedCity}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue
                  placeholder={
                    isLoadingCities
                      ? "Loading cities..."
                      : "Select a city"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Cities</SelectLabel>
                  {cities.map((city) => (
                    <SelectItem key={city._id} value={city.name}>
                      {city.name.charAt(0).toUpperCase() + city.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Product Selector */}
          <div className="w-full sm:w-auto">
            <Select onValueChange={setSelectedProduct} value={selectedProduct}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue
                  placeholder={
                    isLoadingProducts
                      ? "Loading products..."
                      : "Select a product"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Products</SelectLabel>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product.name}>
                      {product.name.charAt(0).toUpperCase() + product.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Add Button */}
          <Button onClick={handleAddItem} className={cn("w-full sm:w-auto px-4 py-2")}>
            Add
          </Button>
        </div>
      </div>

      {/* Display Section */}
      <div className="mt-12 px-4 md:px-0">
        {(isLoadingCities || isLoadingProducts) ? (
          <p className="text-center text-gray-500">Loading data...</p>
        ) : (errorCities || errorProducts) ? (
          <>
            {errorCities && <p className="text-center text-red-500">Error: {errorCities}</p>}
            {errorProducts && <p className="text-center text-red-500">Error: {errorProducts}</p>}
          </>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => {
              const item = items.find((item) => item.city === city.name);
              return (
                <Card key={city._id} className="w-full">
                  <CardHeader>
                    <CardTitle>
                      {city.name.charAt(0).toUpperCase() + city.name.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item && item.products.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {item.products.map((product, i) => (
                          <li key={i}>{product.charAt(0).toUpperCase() + product.slice(1)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No products added</p>
                    )}
                  </CardContent>
                  <div className="px-4 py-2">
                    <Button variant="outline" onClick={() => handleEditClick(items.indexOf(item!))}>
                      Edit
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && editingIndex !== null && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Products</DialogTitle>
            </DialogHeader>
            {editingProducts.length > 0 ? (
              <div className="space-y-2">
                {editingProducts.map((product, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <p className="flex-1">{product}</p>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setEditingProducts(editingProducts.filter((_, i) => i !== index))
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No products added</p>
            )}
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
