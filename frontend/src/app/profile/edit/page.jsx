"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({ farmername: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/userdata", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!data.user) {
          router.replace("/login");
          return;
        }
        setForm({
          farmername: data.user.farmername || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
        });
      })
      .catch(() => toast.error("Unable to load profile"))
      .finally(() => setLoading(false));
  }, [router]);

  const updateField = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/profile/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmername: form.farmername,
          phone: form.phone,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to update profile");
      toast.success(data.message);
      router.push("/profile");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <main className="mx-auto mt-24 max-w-xl p-5">Loading profile...</main>
    );

  return (
    <main className="mx-auto mt-24 max-w-xl p-5">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your personal details.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">
            Name
            <Input
              className="mt-1"
              name="farmername"
              value={form.farmername}
              onChange={updateField}
              required
            />
          </label>
          <label className="block text-sm font-semibold">
            Email
            <Input className="mt-1" name="email" value={form.email} readOnly />
          </label>
          <label className="block text-sm font-semibold">
            Phone
            <Input
              className="mt-1"
              name="phone"
              value={form.phone}
              onChange={updateField}
              inputMode="numeric"
              maxLength={10}
              required
            />
          </label>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
