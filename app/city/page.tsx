// app/city/page.tsx

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


interface City {
  _id: string;
  name: string;
}

const Page = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [inputName, setInputName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingName, setEditingName] = useState("");

  const { toast } = useToast();

  // Fetch cities on component mount
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const res = await fetch("/api/city");
      if (!res.ok) {
        throw new Error("Failed to fetch cities");
      }
      const data: City[] = await res.json();
      setCities(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch cities.",
        variant: "destructive",
      });
    }
  };

  const handleAddName = async () => {
    if (inputName.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Please enter a city name.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/city", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputName.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add city");
      }

      const newCity: City = await res.json();
      setCities([newCity, ...cities]);
      setInputName("");

      toast({
        title: "Success",
        description: `${newCity.name} has been added.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to add city.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (city: City) => {
    setEditingCity(city);
    setEditingName(city.name);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this city?")) return;

    try {
      const res = await fetch("/api/city", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete city");
      }

      setCities(cities.filter((city) => city._id !== id));

      toast({
        title: "Deleted",
        description: "City has been deleted.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete city.",
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCity) return;

    if (editingName.trim() === "") {
      toast({
        title: "Validation Error",
        description: "City name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch("/api/city", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCity._id, name: editingName.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update city");
      }

      const updatedCity: City = await res.json();
      setCities(
        cities.map((city) => (city._id === updatedCity._id ? updatedCity : city))
      );
      setIsDialogOpen(false);
      setEditingCity(null);
      setEditingName("");

      toast({
        title: "Success",
        description: `${updatedCity.name} has been updated.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to update city.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-8">
        {/* Input Section */}
        <div className="flex space-x-4 items-center">
          <Input
            type="text"
            placeholder="Enter a city name"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <Button onClick={handleAddName}>Add</Button>
        </div>

        {/* Display Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <div
              key={city._id}
              className="p-4 border rounded-md shadow-md flex justify-between items-center"
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleEditClick(city)}
              >
                {city.name}
              </div>
              <Button
                variant="destructive"
                onClick={() => handleDelete(city._id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && editingCity && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit City</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Edit city name"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
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
