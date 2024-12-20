"use client"
import React, { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X } from "lucide-react";

const Page = () => {
  const fruits = ["apple", "banana", "blueberry", "grapes", "pineapple"];
  const testData = ["option 1", "option 2", "option 3", "option 4"];
  const [selectedFruit, setSelectedFruit] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [items, setItems] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTexts, setEditingTexts] = useState([]);

  const handleAddItem = () => {
    if (selectedFruit && selectedOption) {
      const existingItemIndex = items.findIndex((item) => item.fruit === selectedFruit);
      if (existingItemIndex !== -1) {
        const updatedItems = [...items];
        updatedItems[existingItemIndex].text += `, ${selectedOption}`;
        setItems(updatedItems);
      } else {
        setItems([...items, { fruit: selectedFruit, text: selectedOption }]);
      }
      setSelectedFruit("");
      setSelectedOption("");
    } else {
      alert("Please select both a fruit and an option!");
    }
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingTexts(items[index]?.text.split(",").map((line) => line.trim()) || []);
    setIsDialogOpen(true);
  };

  const handleSaveEdit = () => {
    const updatedItems = [...items];
    if (editingTexts.length > 0) {
      updatedItems[editingIndex] = {
        ...updatedItems[editingIndex],
        text: editingTexts.join(", "),
      };
    } else {
      updatedItems.splice(editingIndex, 1); // Remove item if all texts are deleted
    }
    setItems(updatedItems);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <Navbar />

      {/* Centered Input Section */}
      <div className="flex flex-col items-center justify-center mt-10">
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-center">
          {/* Fruit Selector */}
          <div className="w-full sm:w-auto">
            <Select onValueChange={setSelectedFruit} value={selectedFruit}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Select a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  {fruits.map((fruit) => (
                    <SelectItem key={fruit} value={fruit}>
                      {fruit.charAt(0).toUpperCase() + fruit.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Option Selector */}
          <div className="w-full sm:w-auto">
            <Select onValueChange={setSelectedOption} value={selectedOption}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Options</SelectLabel>
                  {testData.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fruits.map((fruit, index) => {
            const item = items.find((item) => item.fruit === fruit);
            return (
              <Card key={index} className="w-full">
                <CardHeader>
                  <CardTitle>{fruit.charAt(0).toUpperCase() + fruit.slice(1)}</CardTitle>
                </CardHeader>
                <CardContent>
                  {item ? (
                    item.text.split(",").map((line, i) => <p key={i}>{line.trim()}</p>)
                  ) : (
                    <p className="text-gray-500">No items added</p>
                  )}
                </CardContent>
                <div className="px-4 py-2">
                  <Button variant="outline" onClick={() => handleEditClick(index)}>
                    Edit
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Text</DialogTitle>
            </DialogHeader>
            {editingTexts.length > 0 ? (
              <div className="space-y-2">
                {editingTexts.map((line, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <p className="flex-1">{line}</p>
                    <Button variant="ghost" onClick={() => setEditingTexts(editingTexts.filter((_, i) => i !== index))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No items added</p>
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
