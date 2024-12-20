"use client"
import React, { useState } from "react";
import Navbar from "@/components/Navbar/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Page = () => {
  const [names, setNames] = useState([]);
  const [inputName, setInputName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleAddName = () => {
    if (inputName.trim() === "") {
      alert("Please enter a name!");
      return;
    }
    setNames([...names, inputName]);
    setInputName("");
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingName(names[index]);
    setIsDialogOpen(true);
  };

  const handleDelete = (index) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const handleSaveEdit = () => {
    const updatedNames = [...names];
    updatedNames[editingIndex] = editingName;
    setNames(updatedNames);
    setIsDialogOpen(false);
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
          {names.map((name, index) => (
            <div
              key={index}
              className="p-4 border rounded-md shadow-md flex justify-between items-center"
            >
              <div className="flex-1 cursor-pointer" onClick={() => handleEditClick(index)}>
                {name}
              </div>
              <Button variant="destructive" onClick={() => handleDelete(index)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Name</DialogTitle>
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
