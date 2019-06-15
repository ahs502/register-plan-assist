export default async function apiRequest(service: string, command: string, data?: any): Promise<any> {
  try {
    let response = await fetch(`/api/${service}/${command}`, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify(data || {})
    });
    if (!response.ok) throw new Error(`Code ${response.status}: ${response.statusText}`);
    let json = await response.json();
    return json;
  } catch (reason) {
    return { message: String(reason) };
  }
}
