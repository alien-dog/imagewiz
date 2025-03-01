import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Image } from "@shared/schema";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { Download, Trash2, Loader2, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export function ImageHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: images, isLoading } = useQuery<Image[]>({
    queryKey: [`/api/users/${user?.id}/images`],
    enabled: !!user
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      await apiRequest("DELETE", `/api/images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/images`] });
      toast({
        title: "Image deleted",
        description: "The image has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Image History</CardTitle>
        <CardDescription>
          View and manage your processed images
        </CardDescription>
      </CardHeader>
      <CardContent>
        {images && images.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  {image.processedUrl ? (
                    <img 
                      src={image.processedUrl} 
                      alt="Processed image"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`
                      px-2 py-1 rounded-full text-xs
                      ${image.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'} 
                      text-white
                    `}>
                      {image.status}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(image.metadata?.createdAt?.toString() || new Date().toISOString()), 'MMM d, yyyy')}
                    </span>
                    <div className="flex gap-2">
                      {image.processedUrl && (
                        <a 
                          href={image.processedUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteImageMutation.mutate(image.id)}
                        disabled={deleteImageMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No images found. Try processing some images first!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
