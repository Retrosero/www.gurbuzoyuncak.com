export interface CategoryItem {
  id: string
  name: string
  level: 'main' | 'category' | 'sub'
  parent?: string
}

export interface CategoryHierarchy {
  mainCategories: CategoryItem[]
  categoryMap: Record<string, CategoryItem[]>
  subCategoryMap: Record<string, CategoryItem[]>
}

export async function parseXMLCategories(): Promise<CategoryHierarchy> {
  try {
    // XML dosyasını fetch et
    const response = await fetch('/sample-products.xml')
    const xmlText = await response.text()
    
    // XML'i parse et
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
    
    // Tüm ürünleri al
    const products = xmlDoc.querySelectorAll('Product')
    
    const mainCategoriesSet = new Set<string>()
    const categoriesSet = new Set<string>()
    const subCategoriesSet = new Set<string>()
    
    const categoryRelations: Record<string, string> = {} // category -> mainCategory
    const subCategoryRelations: Record<string, string> = {} // subCategory -> category
    
    // Ürünleri dolaş ve kategorileri topla
    products.forEach(product => {
      const mainCategory = product.querySelector('mainCategory')?.textContent?.trim()
      const category = product.querySelector('category')?.textContent?.trim()
      const subCategory = product.querySelector('subCategory')?.textContent?.trim()
      
      if (mainCategory) {
        mainCategoriesSet.add(mainCategory)
        
        if (category) {
          categoriesSet.add(category)
          categoryRelations[category] = mainCategory
          
          if (subCategory) {
            subCategoriesSet.add(subCategory)
            subCategoryRelations[subCategory] = category
          }
        }
      }
    })
    
    // CategoryItem'ları oluştur
    const mainCategories: CategoryItem[] = Array.from(mainCategoriesSet).map(name => ({
      id: `main-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      level: 'main'
    }))
    
    const categories: CategoryItem[] = Array.from(categoriesSet).map(name => ({
      id: `cat-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      level: 'category',
      parent: categoryRelations[name]
    }))
    
    const subCategories: CategoryItem[] = Array.from(subCategoriesSet).map(name => ({
      id: `sub-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      level: 'sub',
      parent: subCategoryRelations[name]
    }))
    
    // Hiyerarşik mapping oluştur
    const categoryMap: Record<string, CategoryItem[]> = {}
    const subCategoryMap: Record<string, CategoryItem[]> = {}
    
    // Ana kategorilere göre kategorileri grupla
    categories.forEach(cat => {
      if (cat.parent) {
        if (!categoryMap[cat.parent]) {
          categoryMap[cat.parent] = []
        }
        categoryMap[cat.parent].push(cat)
      }
    })
    
    // Kategorilere göre alt kategorileri grupla
    subCategories.forEach(subCat => {
      if (subCat.parent) {
        if (!subCategoryMap[subCat.parent]) {
          subCategoryMap[subCat.parent] = []
        }
        subCategoryMap[subCat.parent].push(subCat)
      }
    })
    
    return {
      mainCategories,
      categoryMap,
      subCategoryMap
    }
    
  } catch (error) {
    console.error('XML kategorileri parse edilemedi:', error)
    return {
      mainCategories: [],
      categoryMap: {},
      subCategoryMap: {}
    }
  }
}

// Kategorileri düz liste olarak getir (dropdown vs. için)
export function getFlatCategoryList(hierarchy: CategoryHierarchy): CategoryItem[] {
  const flatList: CategoryItem[] = []
  
  hierarchy.mainCategories.forEach(mainCat => {
    flatList.push(mainCat)
    
    const subCategories = hierarchy.categoryMap[mainCat.name] || []
    subCategories.forEach(cat => {
      flatList.push(cat)
      
      const subSubCategories = hierarchy.subCategoryMap[cat.name] || []
      subSubCategories.forEach(subCat => {
        flatList.push(subCat)
      })
    })
  })
  
  return flatList
}