# obsidian-svelte-plugin-starter

A modern [Obsidian](https://obsidian.md) plugin starter template that integrates [Svelte](https://svelte.dev) for UI development, powered by [esbuild](https://esbuild.github.io/) and [Bun](https://bun.sh/) for fast builds and dependency management.

---

### ✨ Features

-   ✅ **Svelte Integration** – Build reactive plugin interfaces using [Svelte](https://svelte.dev)
-   ⚡ **Esbuild for Svelte** – Fast bundling via [esbuild](https://esbuild.github.io/) with Svelte support
-   🐰 **Bun Lockfile** – Uses [Bun](https://bun.sh/) for dependency resolution and a `bun.lockb` file
-   📦 **Standard Structure** – Source code in a `src/` folder, output to a `dist/` folder
-   🔁 **Automatic Rebuilds** – Run `bun run dev` to watch for changes and auto-export to `dist/`
-   🚀 **Release Ready** – Includes a GitHub Actions [`release.yml`](.github/workflows/release.yml) workflow for building and publishing releases

---

### 📦 Getting Started

1. Click **"Use this template"** on GitHub to create your own plugin repository
2. Install dependencies:
    ```bash
    bun install
    ```
3. Build the plugin into the `dist/` folder, run:
    ```
    bun run dev
    ```
4. To test the plugin locally in your Obsidian vault, create a symbolic link:

```bash
ln -s /path/to/your/template/dist /path/to/your/vault/.obsidian/plugins/your-plugin-name
```

e.g.

```bash
ln -s /decaf-dev/repos/obsidian-vault-explorer/dist /decaf-dev/desktop/obsidian-development/.obsidian/plugins/obsidian-vault-explorer
```

5. Open Obsidian. Navigate to **Community Plugins** and enable your plugin
