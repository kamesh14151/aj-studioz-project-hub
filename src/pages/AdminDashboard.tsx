import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimateInView from "@/components/AnimateInView";
import { ClipboardCheck, TrendingUp, ChevronDown, Plus, X, Truck, Pencil } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

type AdminTab = "evaluate" | "invest" | "inventory" | "orders";

interface Idea {
  id: string;
  title: string;
  description: string;
  author_id: string;
  status: string;
  created_at: string;
  profiles?: { display_name: string | null } | null;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  total_count: number;
  available_count: number;
  image_url: string | null;
}

interface PaidOrderGroup {
  key: string;
  invoiceNumber: string;
  paymentReference: string;
  createdAt: string;
  paymentStatus: string;
  deliveryStatus: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  items: Array<{ name: string; quantity: number }>;
}

const AdminDashboard = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [tab, setTab] = useState<AdminTab>("evaluate");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [paidOrders, setPaidOrders] = useState<PaidOrderGroup[]>([]);
  const [updatingOrderKey, setUpdatingOrderKey] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemTotal, setNewItemTotal] = useState("");
  const [newItemImage, setNewItemImage] = useState("");
  const [newItemFile, setNewItemFile] = useState<File | null>(null);
  const [newItemDragging, setNewItemDragging] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemCategory, setEditItemCategory] = useState("");
  const [editItemTotal, setEditItemTotal] = useState("");
  const [editItemAvailable, setEditItemAvailable] = useState("");
  const [editItemImage, setEditItemImage] = useState("");
  const [editItemFile, setEditItemFile] = useState<File | null>(null);
  const [editItemDragging, setEditItemDragging] = useState(false);

  const newItemPreview = useMemo(() => {
    if (newItemFile) return URL.createObjectURL(newItemFile);
    if (newItemImage.trim()) return newItemImage.trim();
    return "";
  }, [newItemFile, newItemImage]);

  const editItemPreview = useMemo(() => {
    if (editItemFile) return URL.createObjectURL(editItemFile);
    if (editItemImage.trim()) return editItemImage.trim();
    return "";
  }, [editItemFile, editItemImage]);

  useEffect(() => {
    return () => {
      if (newItemPreview.startsWith("blob:")) URL.revokeObjectURL(newItemPreview);
    };
  }, [newItemPreview]);

  useEffect(() => {
    return () => {
      if (editItemPreview.startsWith("blob:")) URL.revokeObjectURL(editItemPreview);
    };
  }, [editItemPreview]);

  const fetchIdeas = async () => {
    const { data: ideasData, error: ideasError } = await supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false });
    if (ideasError) {
      toast.error(ideasError.message);
      return;
    }
    if (!ideasData) {
      setIdeas([]);
      return;
    }

    const authorIds = [...new Set(ideasData.map((idea) => idea.author_id))];
    if (authorIds.length === 0) {
      setIdeas(ideasData as Idea[]);
      return;
    }

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", authorIds);

    const profileMap = new Map((profilesData ?? []).map((profile) => [profile.user_id, profile.display_name]));

    setIdeas(
      ideasData.map((idea) => ({
        ...idea,
        profiles: { display_name: profileMap.get(idea.author_id) ?? null },
      })) as Idea[]
    );
  };

  const fetchInventory = async () => {
    const { data } = await supabase.from("inventory").select("*").order("name");
    if (data) setInventory(data as InventoryItem[]);
  };

  const fetchPaidOrders = async () => {
    const { data: rows, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      return;
    }

    const bookings = (rows ?? []) as Array<Record<string, unknown>>;
    if (bookings.length === 0) {
      setPaidOrders([]);
      return;
    }

    const inventoryIds = [...new Set(bookings.map((b) => String(b.inventory_id)).filter(Boolean))];
    const { data: inventoryRows } = await supabase.from("inventory").select("id, name").in("id", inventoryIds);
    const inventoryMap = new Map((inventoryRows ?? []).map((item) => [item.id, item.name]));

    const grouped = new Map<string, PaidOrderGroup>();

    for (const booking of bookings) {
      const orderGroupId = String(booking.order_group_id ?? booking.id);
      const key = orderGroupId;
      const quantity = Number(booking.quantity ?? 1);
      const name = inventoryMap.get(String(booking.inventory_id)) ?? "Component";

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          invoiceNumber: String(booking.invoice_number ?? `INV-${String(booking.id).slice(0, 8).toUpperCase()}`),
          paymentReference: String(booking.payment_reference ?? "-"),
          createdAt: String(booking.created_at ?? new Date().toISOString()),
          paymentStatus: String(booking.payment_status ?? "paid"),
          deliveryStatus: String(booking.delivery_status ?? "pending"),
          contactName: String(booking.contact_name ?? "N/A"),
          contactEmail: String(booking.contact_email ?? "N/A"),
          contactPhone: String(booking.contact_phone ?? "N/A"),
          address: [
            booking.delivery_address,
            booking.delivery_city,
            booking.delivery_state,
            booking.delivery_pincode,
          ]
            .map((v) => String(v ?? "").trim())
            .filter(Boolean)
            .join(", "),
          items: [],
        });
      }

      grouped.get(key)?.items.push({ name, quantity });
    }

    setPaidOrders(Array.from(grouped.values()));
  };

  useEffect(() => {
    fetchIdeas();
    fetchInventory();
    fetchPaidOrders();

    // Real-time subscriptions
    const ideasChannel = supabase
      .channel("admin-ideas-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "ideas" }, () => fetchIdeas())
      .subscribe();

    const inventoryChannel = supabase
      .channel("admin-inventory-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => fetchInventory())
      .subscribe();

    const bookingsChannel = supabase
      .channel("admin-bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchInventory();
        fetchPaidOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ideasChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("ideas").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else setOpenDropdown(null);
  };

  const uploadInventoryImage = async (file: File) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `inventory/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("inventory-images").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("inventory-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const addInventoryItem = async () => {
    if (!newItemName.trim() || !newItemCategory.trim() || !newItemTotal) return;
    setSavingItem(true);
    try {
      const total = parseInt(newItemTotal, 10);
      if (Number.isNaN(total) || total < 0) throw new Error("Quantity must be a valid positive number");

      const uploadedImageUrl = newItemFile ? await uploadInventoryImage(newItemFile) : null;
      const imageUrl = uploadedImageUrl || newItemImage.trim() || null;

      const { error } = await supabase.from("inventory").insert({
        name: newItemName.trim(),
        category: newItemCategory.trim(),
        total_count: total,
        available_count: total,
        image_url: imageUrl,
      });

      if (error) throw error;

      toast.success("Item added!");
      setNewItemName("");
      setNewItemCategory("");
      setNewItemTotal("");
      setNewItemImage("");
      setNewItemFile(null);
      setNewItemDragging(false);
      setShowAddItem(false);
      fetchInventory();
    } catch (err: any) {
      toast.error(err?.message || "Unable to add item. Ensure storage bucket policies are configured.");
    } finally {
      setSavingItem(false);
    }
  };

  const startEditItem = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemCategory(item.category);
    setEditItemTotal(String(item.total_count));
    setEditItemAvailable(String(item.available_count));
    setEditItemImage(item.image_url || "");
    setEditItemFile(null);
    setEditItemDragging(false);
  };

  const saveEditedItem = async () => {
    if (!editingItemId || !editItemName.trim() || !editItemCategory.trim()) return;
    setSavingItem(true);
    try {
      const total = parseInt(editItemTotal, 10);
      const available = parseInt(editItemAvailable, 10);
      if (Number.isNaN(total) || total < 0) throw new Error("Total quantity must be valid");
      if (Number.isNaN(available) || available < 0) throw new Error("Available quantity must be valid");

      const uploadedImageUrl = editItemFile ? await uploadInventoryImage(editItemFile) : null;
      const imageUrl = uploadedImageUrl || editItemImage.trim() || null;

      const { error } = await supabase
        .from("inventory")
        .update({
          name: editItemName.trim(),
          category: editItemCategory.trim(),
          total_count: total,
          available_count: Math.min(available, total),
          image_url: imageUrl,
        })
        .eq("id", editingItemId);
      if (error) throw error;

      toast.success("Item updated");
      setEditingItemId(null);
      fetchInventory();
    } catch (err: any) {
      toast.error(err?.message || "Unable to update item");
    } finally {
      setSavingItem(false);
    }
  };

  const formatDeliveryStatus = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

  const updateDeliveryStatus = async (orderGroupId: string, deliveryStatus: "packed" | "shipped" | "delivered") => {
    setUpdatingOrderKey(orderGroupId);
    const { error } = await supabase
      .from("bookings" as any)
      .update({ delivery_status: deliveryStatus })
      .eq("order_group_id", orderGroupId)
      .eq("payment_status", "paid");

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Order marked as ${deliveryStatus}`);
      fetchPaidOrders();
    }
    setUpdatingOrderKey(null);
  };

  const downloadInvoicePdf = (order: PaidOrderGroup) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("AJ Studioz Invoice", 14, 18);

    doc.setFontSize(11);
    doc.text(`Invoice Number: ${order.invoiceNumber}`, 14, 30);
    doc.text(`Order Group: ${order.key}`, 14, 37);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 44);
    doc.text(`Payment Ref: ${order.paymentReference}`, 14, 51);
    doc.text(`Payment Status: ${order.paymentStatus}`, 14, 58);
    doc.text(`Delivery Status: ${formatDeliveryStatus(order.deliveryStatus)}`, 14, 65);

    doc.text("Bill To:", 14, 76);
    doc.text(order.contactName, 14, 83);
    doc.text(order.contactEmail, 14, 90);
    doc.text(order.contactPhone, 14, 97);
    doc.text(order.address, 14, 104, { maxWidth: 180 });

    autoTable(doc, {
      startY: 116,
      head: [["Item", "Quantity"]],
      body: order.items.map((item) => [item.name, String(item.quantity)]),
      styles: { fontSize: 10 },
    });

    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = totalQty * 5;
    const tableBottom = (doc as any).lastAutoTable?.finalY || 130;
    doc.text(`Total Quantity: ${totalQty}`, 14, tableBottom + 12);
    doc.text(`Total Amount: INR ${totalAmount}`, 14, tableBottom + 19);

    doc.save(`${order.invoiceNumber}.pdf`);
  };

  const statusClass = (s: string) =>
    s === "Review" ? "status-chip status-chip-review" :
    s === "Approved" ? "status-chip status-chip-approved" :
    "status-chip status-chip-invested";

  const statuses = ["Review", "Approved", "Invested"];
  const investedIdeas = ideas.filter((i) => i.status === "Invested");
  const reviewCount = ideas.filter((i) => i.status === "Review").length;
  const approvedCount = ideas.filter((i) => i.status === "Approved").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar title="Admin Portal">
        <div className="flex gap-1 flex-wrap">
          {([
            { key: "evaluate" as AdminTab, label: "Evaluation", icon: <ClipboardCheck className="h-4 w-4" /> },
            { key: "invest" as AdminTab, label: "Investments", icon: <TrendingUp className="h-4 w-4" /> },
            { key: "inventory" as AdminTab, label: "Inventory", icon: <Plus className="h-4 w-4" /> },
            { key: "orders" as AdminTab, label: "Orders", icon: <Truck className="h-4 w-4" /> },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all ${
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </Navbar>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {tab === "evaluate" && (
          <AnimateInView>
            <h1 className="display-lg mb-2">Evaluation Center</h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">Review all submitted project ideas</p>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { label: "In Review", count: reviewCount, cls: "status-chip-review" },
                { label: "Approved", count: approvedCount, cls: "status-chip-approved" },
                { label: "Invested", count: investedIdeas.length, cls: "status-chip-invested" },
              ].map((s) => (
                <div key={s.label} className="brand-card text-center py-4 sm:py-6">
                  <div className={`status-chip ${s.cls} mx-auto mb-2`}>{s.label}</div>
                  <p className="display-md text-xl sm:text-[1.75rem]">{s.count}</p>
                </div>
              ))}
            </div>

            <div className="hidden sm:block border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-secondary text-sm font-medium text-muted-foreground">
                <div className="col-span-4">Project</div>
                <div className="col-span-3">Author</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Status</div>
              </div>
              {ideas.map((idea) => (
                <div key={idea.id} className="grid grid-cols-12 gap-4 px-5 py-4 border-t border-border items-center hover:bg-muted/50 transition-colors">
                  <div className="col-span-4">
                    <h4 className="font-serif text-sm">{idea.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{idea.description}</p>
                  </div>
                  <div className="col-span-3 text-sm">{idea.profiles?.display_name ?? "Unknown"}</div>
                  <div className="col-span-2 text-sm text-muted-foreground">{new Date(idea.created_at).toLocaleDateString()}</div>
                  <div className="col-span-3 relative">
                    <button onClick={() => setOpenDropdown(openDropdown === idea.id ? null : idea.id)}
                      className={`${statusClass(idea.status)} cursor-pointer gap-1`}>
                      {idea.status} <ChevronDown className="h-3 w-3" />
                    </button>
                    {openDropdown === idea.id && (
                      <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                        {statuses.map((s) => (
                          <button key={s} onClick={() => updateStatus(idea.id, s)}
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors">{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="sm:hidden space-y-3">
              {ideas.map((idea) => (
                <div key={idea.id} className="brand-card">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-serif text-sm flex-1">{idea.title}</h4>
                    <div className="relative">
                      <button onClick={() => setOpenDropdown(openDropdown === idea.id ? null : idea.id)}
                        className={`${statusClass(idea.status)} cursor-pointer gap-1 text-[10px]`}>
                        {idea.status} <ChevronDown className="h-3 w-3" />
                      </button>
                      {openDropdown === idea.id && (
                        <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-lg shadow-lg z-10 py-1 min-w-[100px]">
                          {statuses.map((s) => (
                            <button key={s} onClick={() => updateStatus(idea.id, s)}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors">{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{idea.description}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{idea.profiles?.display_name ?? "Unknown"}</span>
                    <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {ideas.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No ideas submitted yet.</p>
              </div>
            )}
          </AnimateInView>
        )}

        {tab === "invest" && (
          <AnimateInView>
            <h1 className="display-lg mb-2">Investment Portfolio</h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">Projects selected for institutional backing</p>
            {investedIdeas.length === 0 ? (
              <div className="brand-card text-center py-12">
                <TrendingUp className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No projects marked for investment yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Use the Evaluation Center to mark projects as "Invested".</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
                {investedIdeas.map((idea, i) => (
                  <AnimateInView key={idea.id} delay={i * 100}>
                    <div className="brand-card border-2">
                      <div className="flex items-start justify-between mb-3">
                        <span className={statusClass(idea.status)}>{idea.status}</span>
                        <span className="text-xs text-muted-foreground">{new Date(idea.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-serif text-base sm:text-lg mb-2">{idea.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3">{idea.description}</p>
                      <p className="text-xs sm:text-sm font-medium">Submitted by {idea.profiles?.display_name ?? "Unknown"}</p>
                    </div>
                  </AnimateInView>
                ))}
              </div>
            )}
          </AnimateInView>
        )}

        {tab === "inventory" && (
          <AnimateInView>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="display-lg">Manage Inventory</h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-1">Add and manage college components</p>
              </div>
              <button onClick={() => setShowAddItem(true)} className="pill-btn gap-2 self-start">
                <Plus className="h-4 w-4" /> Add Item
              </button>
            </div>

            {showAddItem && (
              <div className="brand-card mb-6 relative">
                <button onClick={() => setShowAddItem(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
                <h3 className="font-serif text-lg mb-4">Add Inventory Item</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Item name"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <input type="text" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} placeholder="Category"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <input type="number" value={newItemTotal} onChange={(e) => setNewItemTotal(e.target.value)} placeholder="Quantity"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <input type="url" value={newItemImage} onChange={(e) => setNewItemImage(e.target.value)} placeholder="Image URL (optional)"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <div className="sm:col-span-2 space-y-2">
                    <input
                      id="new-item-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewItemFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="new-item-file"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setNewItemDragging(true);
                      }}
                      onDragLeave={() => setNewItemDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setNewItemDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) setNewItemFile(file);
                      }}
                      className={`block cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center text-sm transition-colors ${
                        newItemDragging ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      {newItemFile ? `${newItemFile.name} selected` : "Drop image here or click to upload"}
                    </label>
                    {newItemPreview && (
                      <div className="rounded-xl overflow-hidden border border-border bg-muted/40 max-w-xs">
                        <img src={newItemPreview} alt="New item preview" className="w-full aspect-[16/10] object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={addInventoryItem} className="pill-btn mt-3"
                  disabled={savingItem || !newItemName.trim() || !newItemCategory.trim() || !newItemTotal}>
                  {savingItem ? "Saving..." : "Add Item"}
                </button>
              </div>
            )}

            {editingItemId && (
              <div className="brand-card mb-6 relative">
                <button onClick={() => setEditingItemId(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
                <h3 className="font-serif text-lg mb-4">Edit Inventory Item</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" value={editItemName} onChange={(e) => setEditItemName(e.target.value)} placeholder="Item name"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <input type="text" value={editItemCategory} onChange={(e) => setEditItemCategory(e.target.value)} placeholder="Category"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <input type="number" value={editItemTotal} onChange={(e) => setEditItemTotal(e.target.value)} placeholder="Total quantity"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <input type="number" value={editItemAvailable} onChange={(e) => setEditItemAvailable(e.target.value)} placeholder="Available quantity"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <input type="url" value={editItemImage} onChange={(e) => setEditItemImage(e.target.value)} placeholder="Image URL (optional)"
                    className="rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                  <div className="sm:col-span-2 space-y-2">
                    <input
                      id="edit-item-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditItemFile(e.target.files?.[0] ?? null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="edit-item-file"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setEditItemDragging(true);
                      }}
                      onDragLeave={() => setEditItemDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setEditItemDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) setEditItemFile(file);
                      }}
                      className={`block cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center text-sm transition-colors ${
                        editItemDragging ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      {editItemFile ? `${editItemFile.name} selected` : "Drop replacement image here or click to upload"}
                    </label>
                    {editItemPreview && (
                      <div className="rounded-xl overflow-hidden border border-border bg-muted/40 max-w-xs">
                        <img src={editItemPreview} alt="Edit item preview" className="w-full aspect-[16/10] object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={saveEditedItem} className="pill-btn mt-3" disabled={savingItem}>
                  {savingItem ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.map((item, i) => (
                <AnimateInView key={item.id} delay={i * 60}>
                  <div className="rounded-[28px] border-2 border-[#c9c3b8] bg-[#d8d2c8] p-3 sm:p-4 overflow-hidden">
                    {item.image_url && (
                      <div className="aspect-[16/10] bg-muted overflow-hidden rounded-[20px]">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="pt-3 px-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-[1.05rem] leading-snug flex-1 line-clamp-1 text-[#2f2a24]">{item.name}</h3>
                        <button onClick={() => startEditItem(item)} className="pill-btn-outline px-2 py-1 text-[10px] gap-1 bg-white/70">
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[12px]">
                        <span className="inline-flex rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-[#44403c]">{item.category}</span>
                        <span className={item.available_count > 0 ? "text-[#2f2a24] font-semibold" : "text-destructive font-semibold"}>
                          {item.available_count} / {item.total_count}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-[#5f5950]">Available components</p>
                    </div>
                  </div>
                </AnimateInView>
              ))}
            </div>

            {inventory.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No inventory items yet. Add your first one above.</p>
              </div>
            )}
          </AnimateInView>
        )}

        {tab === "orders" && (
          <AnimateInView>
            <h1 className="display-lg mb-2">Paid Orders</h1>
            <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">Delivery queue with invoice and contact details</p>

            <div className="space-y-3 sm:space-y-4">
              {paidOrders.map((order, i) => (
                <AnimateInView key={order.key} delay={i * 60}>
                  <div className="brand-card p-4 sm:p-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-serif text-sm sm:text-base">{order.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                      <p className="text-xs mt-1">{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</p>
                      <p className="text-xs text-muted-foreground mt-1">{order.contactName} · {order.contactPhone}</p>
                      <p className="text-xs text-muted-foreground">{order.contactEmail}</p>
                      <p className="text-xs text-muted-foreground">{order.address || "Address not provided"}</p>
                    </div>
                    <div className="text-right">
                      <span className="status-chip">{formatDeliveryStatus(order.deliveryStatus)}</span>
                      <p className="text-xs text-muted-foreground mt-2">Payment: {order.paymentStatus}</p>
                      <p className="text-xs text-muted-foreground">Ref: {order.paymentReference}</p>
                      <div className="mt-3 flex gap-2 justify-end flex-wrap">
                        <button
                          onClick={() => updateDeliveryStatus(order.key, "packed")}
                          disabled={updatingOrderKey === order.key}
                          className="pill-btn-outline text-xs px-2 py-1"
                        >
                          Packed
                        </button>
                        <button
                          onClick={() => updateDeliveryStatus(order.key, "shipped")}
                          disabled={updatingOrderKey === order.key}
                          className="pill-btn-outline text-xs px-2 py-1"
                        >
                          Shipped
                        </button>
                        <button
                          onClick={() => updateDeliveryStatus(order.key, "delivered")}
                          disabled={updatingOrderKey === order.key}
                          className="pill-btn-outline text-xs px-2 py-1"
                        >
                          Delivered
                        </button>
                      </div>
                      <button onClick={() => downloadInvoicePdf(order)} className="pill-btn-outline text-xs px-3 py-1.5 mt-3">Download PDF</button>
                    </div>
                  </div>
                </AnimateInView>
              ))}

              {paidOrders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Truck className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>No paid orders yet.</p>
                </div>
              )}
            </div>
          </AnimateInView>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
