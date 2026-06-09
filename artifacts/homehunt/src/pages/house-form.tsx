import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateHouse, useUpdateHouse, useGetHouse, getGetHouseQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyMap } from "@/components/Map";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  rentPrice: z.coerce.number().min(1, "Rent price is required"),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  city: z.string().min(1, "City is required"),
  address: z.string().min(5, "Address is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const CITIES = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"];
const COMMON_AMENITIES = [
  "Parking", "Security", "Borehole Water", "Wifi", 
  "Gym", "Swimming Pool", "Balcony", "Backup Generator"
];

export function HouseForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== "new";
  const houseId = parseInt(id || "0");
  const [, setLocation] = useLocation();

  const { data: existingHouse, isLoading: isLoadingHouse } = useGetHouse(houseId, {
    query: { enabled: isEditing, queryKey: getGetHouseQueryKey(houseId) }
  });

  const createHouse = useCreateHouse();
  const updateHouse = useUpdateHouse();

  const [imageUrl, setImageUrl] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      rentPrice: 0,
      bedrooms: 0,
      bathrooms: 0,
      city: "",
      address: "",
      latitude: -1.286389, // Default to Nairobi
      longitude: 36.817223,
      images: [],
      amenities: [],
    },
  });

  useEffect(() => {
    if (isEditing && existingHouse) {
      form.reset({
        title: existingHouse.title,
        description: existingHouse.description || "",
        rentPrice: existingHouse.rentPrice,
        bedrooms: existingHouse.bedrooms || 0,
        bathrooms: existingHouse.bathrooms || 0,
        city: existingHouse.city,
        address: existingHouse.address,
        latitude: existingHouse.latitude,
        longitude: existingHouse.longitude,
        images: existingHouse.images || [],
        amenities: existingHouse.amenities || [],
      });
    }
  }, [existingHouse, isEditing, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing) {
        await updateHouse.mutateAsync({ id: houseId, data });
        toast.success("Listing updated successfully");
      } else {
        await createHouse.mutateAsync({ data });
        toast.success("Listing created successfully");
      }
      queryClient.invalidateQueries();
      setLocation("/landlord-dashboard");
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const addImage = () => {
    if (imageUrl) {
      const currentImages = form.getValues("images");
      form.setValue("images", [...currentImages, imageUrl]);
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    form.setValue("images", currentImages.filter((_, i) => i !== index));
  };

  if (isEditing && isLoadingHouse) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          {isEditing ? "Edit Listing" : "Add New Listing"}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Title</FormLabel>
                      <FormControl><Input placeholder="e.g. Modern 2BR Apartment in Kilimani" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rentPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rent Price (KES / month)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="e.g. Argwings Kodhek Rd" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Amenities</FormLabel>
                  <div className="grid grid-cols-2 gap-2 p-4 border rounded-md bg-muted/20">
                    {COMMON_AMENITIES.map((amenity) => (
                      <FormField
                        key={amenity}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => {
                          return (
                            <FormItem key={amenity} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(amenity)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, amenity])
                                      : field.onChange(field.value?.filter((value) => value !== amenity))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{amenity}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <FormLabel>Location on Map (Click to set)</FormLabel>
                  <div className="h-[300px] border rounded-md overflow-hidden relative z-0">
                    <PropertyMap 
                      center={[form.getValues("latitude"), form.getValues("longitude")]}
                      zoom={isEditing ? 14 : 6}
                      onLocationSelect={(lat, lng) => {
                        form.setValue("latitude", lat);
                        form.setValue("longitude", lng);
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Lat: {form.watch("latitude").toFixed(6)}, Lng: {form.watch("longitude").toFixed(6)}
                  </div>
                </div>

                <div className="space-y-3">
                  <FormLabel>Images (URLs)</FormLabel>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://..." 
                      value={imageUrl} 
                      onChange={(e) => setImageUrl(e.target.value)} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addImage();
                        }
                      }}
                    />
                    <Button type="button" onClick={addImage} variant="secondary"><Plus className="h-4 w-4" /></Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {form.watch("images").map((img, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden border group">
                        <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setLocation("/landlord-dashboard")}>
                Cancel
              </Button>
              <Button type="submit" disabled={createHouse.isPending || updateHouse.isPending}>
                {(createHouse.isPending || updateHouse.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Listing"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}
