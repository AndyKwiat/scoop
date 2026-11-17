# scoop

**Tinder for things to do in town.** scoop is a mobile app (React Native / Expo) that shows you local businesses and places one card at a time: bars, gyms, libraries, museums, parks, art galleries and more. Swipe right or left to move through them, tap the sides of a photo to flip through more pictures, and tap the card for details like the address and how far away it is. Settings let you filter by category, and you can save favourites as you go. It's currently set up for Guelph, Ontario.

> 🚧 **Work in progress.** This is a prototype, and the backend server is no longer running.

## How it works

The place data comes from **Google Maps (Places API)**. Instead of calling Google live from the phone, a set of scripts collects it ahead of time:

- **`scripts/`** searches for places around town, fetches their details and photo references, downloads and downsizes the photos, and uploads everything to DynamoDB and an image host.
- **`server/`** is a small Express server that serves the cached place list to the app (`/places`). It includes a Svelte **editor** (`server/editor/`) for reviewing and tweaking place entries.
- **`app/`** is the Expo app. It loads the places, filters them to those within about 20 km, shuffles them and turns them into swipeable cards.

## Configuration

Hosts and keys come from environment variables, not the code:

| Variable | Used by |
|---|---|
| `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_KEY` | app: where to fetch places and the key to send |
| `SCOOP_API_KEY` | server: the key the app must send |
| `SCOOP_EDITOR_LOGIN`, `SCOOP_EDITOR_KEY` | server: editor login (base64 of `user:pass`) and session key |
| `SCOOP_SERVER`, `SCOOP_SSH_KEY` | `scripts/copy_to_server`: deploy target |

The data scripts also need a Google Maps API key (replace `YOUR_GOOGLE_API_KEY`) and AWS credentials for DynamoDB.
