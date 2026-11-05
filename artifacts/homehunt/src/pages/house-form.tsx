import { useState, useEffect, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@clerk/react";
import { useCreateHouse, useUpdateHouse, useGetHouse, getGetHouseQueryKey } from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
import { compressImage } from "@/lib/compress-image";
import { PROPERTY_TYPES } from "@/lib/property-types";
import { isInKenya, normalizeLng } from "@/lib/kenya-bounds";
import { ApiError } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PropertyMap, KENYA_CENTER } from "@/components/Map";
import { Loader2, Upload, X, ImageIcon, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { queryClient } from "@/lib/queryClient";
import {
  getCountyNames,
  getTownsForCounty,
  getEstatesForTown,
  getTownCenter,
  getCountyCenter,
} from "@/lib/kenya-locations";


// Radix Select does not allow an empty-string item value
const ESTATE_NONE = "__none__";

const COMMON_AMENITIES = [
  "Parking", "Security", "Borehole Water", "Wifi",
  "Gym", "Swimming Pool", "Balcony", "Backup Generator",
  "CCTV", "Gated Community", "Garden", "Rooftop Access",
];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  rentPrice: z.coerce.number().min(1, "Rent price is required"),
  propertyType: z.string().min(1, "Property type is required"),
  contactPhone: z.string().min(7, "Contact phone is required"),
  bedrooms: z.coerce.number().min(0).default(1),
  bathrooms: z.coerce.number().min(0).default(1),
  county: z.string().min(1, "County is required"),
  town: z.string().min(1, "Town is required"),
  estate: z.string().optional().default(""),
  address: z.string().min(3, "Address is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
}).refine((v) => isInKenya(v.latitude, v.longitude), {
  path: ["latitude"],
  message: "The map pin is outside Kenya. Click the map exactly where the property is.",
});

type FormValues = z.infer<typeof formSchema>;

export function HouseForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id && id !== "new";
  const houseId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>(KENYA_CENTER);
  const [hasPinned, setHasPinned] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const { getToken } = useAuth();

  const { data: existingHouse, isLoading: isLoadingHouse } = useGetHouse(houseId, {
    query: { enabled: isEditing, queryKey: getGetHouseQueryKey(houseId) }
  });

  const createHouse = useCreateHouse();
  const updateHouse = useUpdateHouse();

  const { uploadFile, isUploading, progress } = useUpload({
    getHeaders: async () => {
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      return headers;
    },
    onError: (err) => toast.error(`Upload failed: ${err.message}`),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      rentPrice: 0,
      propertyType: "",
      contactPhone: "",
      bedrooms: 1,
      bathrooms: 1,
      county: "",
      town: "",
      estate: "",
      address: "",
      latitude: KENYA_CENTER[0],
      longitude: KENYA_CENTER[1],
      images: [],
      amenities: [],
    },
  });

  useEffect(() => {
    if (isEditing && existingHouse) {
      const county = existingHouse.county || existingHouse.city || "";
      const town = existingHouse.town || "";
      setSelectedCounty(county);
      setSelectedTown(town);
      form.reset({
        title: existingHouse.title,
        description: existingHouse.description || "",
        rentPrice: existingHouse.rentPrice,
        propertyType: existingHouse.propertyType || "",
        contactPhone: existingHouse.contactPhone || "",
        bedrooms: existingHouse.bedrooms || 1,
        bathrooms: existingHouse.bathrooms || 1,
        county,
        town,
        estate: existingHouse.estate || "",
        address: existingHouse.address,
        latitude: existingHouse.latitude,
        longitude: existingHouse.longitude,
        images: existingHouse.images || [],
        amenities: existingHouse.amenities || [],
      });
      setMapCenter([existingHouse.latitude, existingHouse.longitude]);
      setHasPinned(true);
    }
  }, [existingHouse, isEditing, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing) {
        await updateHouse.mutateAsync({ id: houseId, data: {
          ...data,
          city: data.county,
        } });
        toast.success("Listing updated successfully!");
      } else {
        await createHouse.mutateAsync({ data: {
          ...data,
          city: data.county,
        } });
        toast.success("Listing created successfully!");
      }
      queryClient.invalidateQueries();
      setLocation("/landlord-dashboard");
    } catch (error: unknown) {
      // Show the API's own explanation, without the "HTTP 400 Bad Request:" prefix
      const apiMessage = error instanceof ApiError ? (error.data as { error?: string } | null)?.error : undefined;
      const message =
        apiMessage || (error instanceof Error ? error.message : "Failed to save listing. Please try again.");
      toast.error(message);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      try {
        setIsCompressing(true);
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.82,
          skipBelowKb: 300,
        });
        setIsCompressing(false);

        const result = await uploadFile(compressed);
        if (result) {
          const servingUrl = `/api/storage${result.objectPath}`;
          const currentImages = form.getValues("images");
          form.setValue("images", [...currentImages, servingUrl]);
          toast.success(`${file.name} uploaded`);
        }
      } catch {
        setIsCompressing(false);
        toast.error(`Could not process ${file.name}`);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    form.setValue("images", currentImages.filter((_, i) => i !== index));
  };

  const countyNames = getCountyNames();
  const towns = selectedCounty ? getTownsForCounty(selectedCounty) : [];
  const estates = selectedCounty && selectedTown ? getEstatesForTown(selectedCounty, selectedTown) : [];

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Listing" : "Add New Listing"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? "Update your property details below." : "Fill in the details to list your property across Kenya."}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Modern 2BR Apartment in Kilimani" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[100px] resize-none" placeholder="Describe the property..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Property Type */}
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROPERTY_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rent + Bedrooms/Bathrooms */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rentPrice"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Rent (KES/month) *</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="e.g. 25000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl><Input type="number" min={0} {...field} /></FormControl>
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
                        <FormControl><Input type="number" min={0} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Phone */}
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input className="pl-9" placeholder="+254 712 345 678" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location hierarchy: County → Town → Estate */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="font-medium text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> Location (Kenya)
                  </div>

                  <FormField
                    control={form.control}
                    name="county"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>County *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            setSelectedCounty(val);
                            setSelectedTown("");
                            form.setValue("town", "");
                            form.setValue("estate", "");
                            const center = getCountyCenter(val);
                            setMapCenter(center);
                            form.setValue("latitude", center[0]);
                            form.setValue("longitude", center[1]);
                            setHasPinned(true);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select county" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {countyNames.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="town"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Town *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            setSelectedTown(val);
                            form.setValue("estate", "");
                            const center = getTownCenter(selectedCounty, val);
                            setMapCenter(center);
                            form.setValue("latitude", center[0]);
                            form.setValue("longitude", center[1]);
                            setHasPinned(true);
                          }}
                          disabled={!selectedCounty}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedCounty ? "Select town" : "Select county first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {towns.map(t => (
                              <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estate / Area</FormLabel>
                        {estates.length > 0 ? (
                          <Select
                            value={field.value || ESTATE_NONE}
                            onValueChange={(val) => field.onChange(val === ESTATE_NONE ? "" : val)}
                            disabled={!selectedTown}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select estate (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              <SelectItem value={ESTATE_NONE}>None / Other</SelectItem>
                              {estates.map(e => (
                                <SelectItem key={e} value={e}>{e}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input placeholder="Estate or area name (optional)" {...field} />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Argwings Kodhek Rd, Apt 4B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amenities */}
                <div className="space-y-3">
                  <label className="text-sm font-medium leading-none">Amenities</label>
                  <div className="grid grid-cols-2 gap-2 p-4 border rounded-md bg-muted/20">
                    {COMMON_AMENITIES.map((amenity) => (
                      <FormField
                        key={amenity}
                        control={form.control}
                        name="amenities"
                        render={({ field }) => (
                          <FormItem key={amenity} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(amenity)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, amenity])
                                    : field.onChange(field.value?.filter((v) => v !== amenity));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">{amenity}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column: Map + Photos */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium leading-none">Pin Location on Map</label>
                  <p className="text-xs text-muted-foreground">Click on the map to set the exact property location.</p>
                  <div className="h-[320px] border rounded-md overflow-hidden relative z-0">
                    <PropertyMap
                      center={mapCenter}
                      zoom={selectedTown ? 14 : selectedCounty ? 10 : 7}
                      selectedPosition={hasPinned ? [form.watch("latitude"), form.watch("longitude")] : undefined}
                      onLocationSelect={(lat, rawLng) => {
                        const lng = normalizeLng(rawLng);
                        form.setValue("latitude", lat, { shouldValidate: form.formState.isSubmitted });
                        form.setValue("longitude", lng);
                        setMapCenter([lat, lng]);
                        setHasPinned(true);
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground font-mono bg-muted/30 rounded px-2 py-1">
                    📍 Lat: {form.watch("latitude").toFixed(6)}, Lng: {form.watch("longitude").toFixed(6)}
                  </div>
                  {form.formState.errors.latitude && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.latitude.message}</p>
                  )}
                </div>

                {/* Photos */}
                <div className="space-y-3">
                  <label className="text-sm font-medium leading-none">Property Photos</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 border-dashed flex flex-col gap-1"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isCompressing}
                  >
                    {isCompressing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Compressing image…</span>
                      </>
                    ) : isUploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Uploading… {progress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload photos (JPG, PNG, WebP)</span>
                        <span className="text-xs text-muted-foreground/60">Large images are auto-compressed</span>
                      </>
                    )}
                  </Button>

                  {form.watch("images").length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {form.watch("images").map((img, index) => (
                        <div key={index} className="relative aspect-video rounded-md overflow-hidden border group">
                          <img src={img} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
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
                  ) : (
                    <div className="flex flex-col items-center justify-center h-20 rounded-md border border-dashed text-muted-foreground text-sm gap-1">
                      <ImageIcon className="h-5 w-5" />
                      <span>No photos yet</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setLocation("/landlord-dashboard")}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createHouse.isPending || updateHouse.isPending}
                className="min-w-[140px]"
              >
                {(createHouse.isPending || updateHouse.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Save Changes" : "Create Listing"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}
