const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
console.log('API_URL:', API_URL);

export async function testConnection() {
    const response = await fetch(`${API_URL}/test-connection`);
    if (!response.ok) {
        throw new Error('Failed to connect to the database');
    }
    return response.json();
}

export async function fetchProducts() {
  const response = await fetch(`${API_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

export async function fetchProductById(id: number) {
  console.log(`Fetching product with ID: ${id} from ${API_URL}/products/${id}`);
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    
    if (!response.ok) {
      console.error(`Error response: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function fetchCategories() {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}