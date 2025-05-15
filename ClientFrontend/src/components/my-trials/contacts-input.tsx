"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

export interface Contact {
  name: string;
  email: string;
  phone: string;
  isMainContact: boolean;
}

interface ContactsInputProps {
  field: {
    value: Contact[];
    onChange: (value: Contact[]) => void;
  };
}

export function ContactsInput({ field }: ContactsInputProps) {
  const [newContact, setNewContact] = useState<Contact>({
    name: "",
    email: "",
    phone: "",
    isMainContact: false,
  });

  const [isAdding, setIsAdding] = useState(false);

  function addContact() {
    if (
      newContact.name.trim() === "" ||
      newContact.email.trim() === "" ||
      newContact.phone.trim() === ""
    ) {
      setIsAdding(false);
      return;
    }

    field.onChange([...field.value, newContact]);
    setNewContact({
      name: "",
      email: "",
      phone: "",
      isMainContact: false,
    });
    setIsAdding(false);
  }

  function removeContact(index: number) {
    const updated = field.value.filter((_, i) => i !== index);
    field.onChange(updated);
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {field.value.map((contact, index) => (
          <div
            key={index}
            className="flex flex-col items-center rounded-md border px-4 py-2"
          >
            <span className="font-bold">{contact.name}</span>
            <Button
              size="sm"
              variant="destructive"
              className="h-fit p-2 text-xs"
              onClick={() => removeContact(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {!isAdding && (
        <Button onClick={() => setIsAdding(true)}>Add Contact</Button>
      )}

      {isAdding && (
        <div className="rounded-md border p-4">
          <div className="mb-2 font-bold">New Contact Details</div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Name"
              value={newContact.name}
              onChange={(e) =>
                setNewContact({ ...newContact, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              type="email"
              value={newContact.email}
              onChange={(e) =>
                setNewContact({ ...newContact, email: e.target.value })
              }
            />
            <Input
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) =>
                setNewContact({ ...newContact, phone: e.target.value })
              }
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="main-contact"
                checked={newContact.isMainContact}
                onCheckedChange={(checked) =>
                  setNewContact({
                    ...newContact,
                    isMainContact:
                      checked === "indeterminate" ? false : checked,
                  })
                }
              />
              <label
                htmlFor="main-contact"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Main contact
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={addContact}>Save Contact</Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
