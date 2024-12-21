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

interface Association {
  _id: string;
  city: City;
  products: Product[];
}

const Page = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [associations, setAssociations] = useState<Association[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssociation, setEditingAssociation] = useState<Association | null>(null);
  const [editingProducts, setEditingProducts] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isLoadingAssociations, setIsLoadingAssociations] = useState<boolean>(false);
  const [errorCities, setErrorCities] = useState<string | null>(null);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [errorAssociations, setErrorAssociations] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

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

  // Fetch associations from the API
  useEffect(() => {
    const fetchAssociations = async () => {
      setIsLoadingAssociations(true);
      try {
        const response = await fetch("/api/city-product");
        if (!response.ok) {
          throw new Error("Failed to fetch associations");
        }
        const data: Association[] = await response.json();
        setAssociations(data);
        setErrorAssociations(null);
      } catch (err: any) {
        console.error("Error fetching associations:", err);
        setErrorAssociations(err.message || "An error occurred");
      } finally {
        setIsLoadingAssociations(false);
      }
    };

    fetchAssociations();
  }, []);

  const handleAddItem = async () => {
    if (selectedCity && selectedProduct) {
      setIsAdding(true);
      try {
        // Find the city and product IDs
        const city = cities.find(c => c.name === selectedCity);
        const product = products.find(p => p.name === selectedProduct);

        if (!city || !product) {
          alert("Selected city or product not found");
          return;
        }

        const response = await fetch("/api/city-product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cityId: city._id,
            productIds: [product._id],
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add product to city");
        }

        const newAssociation: Association = await response.json();

        // Update the associations state
        setAssociations(prev => {
          const existing = prev.find(a => a.city._id === city._id);
          if (existing) {
            // Merge products, avoiding duplicates
            const updatedProductsMap = new Map(existing.products.map(p => [p._id, p]));
            newAssociation.products.forEach(p => updatedProductsMap.set(p._id, p));
            const updatedProducts = Array.from(updatedProductsMap.values());
            return prev.map(a =>
              a.city._id === city._id ? { ...a, products: updatedProducts } : a
            );
          } else {
            return [...prev, newAssociation];
          }
        });

        // Reset selections
        setSelectedCity("");
        setSelectedProduct("");
      } catch (error: any) {
        alert(error.message || "An error occurred while adding the product to the city");
      } finally {
        setIsAdding(false);
      }
    } else {
      alert("Please select both a city and a product!");
    }
  };

  const handleEditClick = (association: Association) => {
    setEditingAssociation(association);
    setEditingProducts(association.products.map(p => p._id));
    setIsDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAssociation) return;

    try {
      const response = await fetch("/api/city-product", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cityId: editingAssociation.city._id,
          productIds: editingProducts,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update products for city");
      }

      const updatedAssociation: Association = await response.json();

      setAssociations(prev =>
        prev.map(a => (a.city._id === updatedAssociation.city._id ? updatedAssociation : a))
      );

      setIsDialogOpen(false);
      setEditingAssociation(null);
      setEditingProducts([]);
    } catch (error: any) {
      alert(error.message || "An error occurred while updating the products for the city");
    }
  };

  const handleRemoveProduct = async (association: Association, productId: string) => {
    try {
      const response = await fetch("/api/city-product", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cityId: association.city._id,
          productIds: [productId],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove product from city");
      }

      // Update the associations state
      setAssociations(prev => {
        const updated = prev.map(a => {
          if (a.city._id === association.city._id) {
            const updatedProducts = a.products.filter(p => p._id !== productId);
            return { ...a, products: updatedProducts };
          }
          return a;
        }).filter(a => a.products.length > 0); // Remove associations with no products

        return updated;
      });
    } catch (error: any) {
      alert(error.message || "An error occurred while removing the product from the city");
    }
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
          <Button
            onClick={handleAddItem}
            className={cn("w-full sm:w-auto px-4 py-2")}
            disabled={isAdding || isLoadingCities || isLoadingProducts}
          >
            {isAdding ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>

      {/* Display Section */}
      <div className="mt-12 px-4 md:px-0">
        {(isLoadingCities || isLoadingProducts || isLoadingAssociations) ? (
          <p className="text-center text-gray-500">Loading data...</p>
        ) : (errorCities || errorProducts || errorAssociations) ? (
          <>
            {errorCities && <p className="text-center text-red-500">Error: {errorCities}</p>}
            {errorProducts && <p className="text-center text-red-500">Error: {errorProducts}</p>}
            {errorAssociations && <p className="text-center text-red-500">Error: {errorAssociations}</p>}
          </>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => {
              const association = associations.find(a => a.city._id === city._id);
              return (
                <Card key={city._id} className="w-full">
                  <CardHeader>
                    <CardTitle>
                      {city.name.charAt(0).toUpperCase() + city.name.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {association && association.products.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {association.products.map((product) => (
                          <li key={product._id} className="flex items-center">
                            {product.name.charAt(0).toUpperCase() + product.name.slice(1)}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-2 text-red-500"
                              onClick={() => handleRemoveProduct(association, product._id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No products added</p>
                    )}
                  </CardContent>
                  <div className="px-4 py-2">
                    <Button
                      variant="outline"
                      onClick={() => association && handleEditClick(association)}
                      disabled={!association}
                    >
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
      {isDialogOpen && editingAssociation && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Products for {editingAssociation.city.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {products.map((product) => (
                <div key={product._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingProducts.includes(product._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditingProducts(prev => [...prev, product._id]);
                      } else {
                        setEditingProducts(prev => prev.filter(pid => pid !== product._id));
                      }
                    }}
                  />
                  <label>
                    {product.name.charAt(0).toUpperCase() + product.name.slice(1)}
                  </label>
                </div>
              ))}
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
