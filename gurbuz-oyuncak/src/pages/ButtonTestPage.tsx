import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  User, 
  Heart, 
  ShoppingCart,
  Search,
  Filter,
  Download
} from 'lucide-react'

const ButtonTestPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Buton Stilleri Test Sayfası</h1>
        <p className="text-muted-foreground">
          Güncellenmiş buton stillerini test edin
        </p>
      </div>

      {/* Primary Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Primary Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="default" size="sm">Small</Button>
          <Button variant="default" size="lg">Large</Button>
          <Button variant="default" className="gap-2">
            <Plus className="h-4 w-4" />
            With Icon
          </Button>
          <Button variant="default" size="sm" className="gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </Card>

      {/* Secondary Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Secondary Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary">Secondary</Button>
          <Button variant="secondary" size="sm">Small</Button>
          <Button variant="secondary" size="lg">Large</Button>
          <Button variant="secondary" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </Card>

      {/* Accent Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Accent Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="accent">Accent</Button>
          <Button variant="accent" size="sm">Small</Button>
          <Button variant="accent" size="lg">Large</Button>
          <Button variant="accent" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </Card>

      {/* Success Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Success Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="success">Success</Button>
          <Button variant="success" size="sm">Small</Button>
          <Button variant="success" size="lg">Large</Button>
          <Button variant="success" className="gap-2">
            <Heart className="h-4 w-4" />
            Favorite
          </Button>
        </div>
      </Card>

      {/* Outline Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Outline Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="outline">Outline</Button>
          <Button variant="outline" size="sm">Small</Button>
          <Button variant="outline" size="lg">Large</Button>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Ghost Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Ghost Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="ghost">Ghost</Button>
          <Button variant="ghost" size="sm">Small</Button>
          <Button variant="ghost" size="lg">Large</Button>
          <Button variant="ghost" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </Button>
        </div>
      </Card>

      {/* Destructive Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Destructive Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="destructive">Delete</Button>
          <Button variant="destructive" size="sm">Small</Button>
          <Button variant="destructive" size="lg">Large</Button>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </Card>

      {/* Link Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Link Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="link">Link Style</Button>
          <Button variant="link" size="sm">Small Link</Button>
          <Button variant="link" className="gap-2">
            <Search className="h-4 w-4" />
            Search More
          </Button>
        </div>
      </Card>

      {/* Icon Buttons */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Icon Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
          <Button variant="accent" size="icon">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Icon Button Sizes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Icon Button Sizes</h2>
        <div className="flex items-center gap-4">
          <Button variant="default" size="icon-sm">
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="default" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="default" size="icon-lg">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* Disabled States */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Disabled States</h2>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Default Disabled</Button>
          <Button variant="secondary" disabled>Secondary Disabled</Button>
          <Button variant="outline" disabled>Outline Disabled</Button>
          <Button variant="destructive" disabled>Destructive Disabled</Button>
          <Button variant="ghost" disabled>Ghost Disabled</Button>
          <Button variant="accent" disabled>Accent Disabled</Button>
          <Button variant="success" disabled>Success Disabled</Button>
          <Button variant="link" disabled>Link Disabled</Button>
        </div>
      </Card>

      {/* Button Groups */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Button Groups</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline">Previous</Button>
            <Button variant="default">Next</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
            <Button variant="accent" className="gap-2">
              <Heart className="h-4 w-4" />
              Add to Favorites
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ButtonTestPage