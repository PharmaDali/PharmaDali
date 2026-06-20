# IDE Setup & Troubleshooting (Linter Warnings)

When working with Laravel in VS Code, you might see false-positive warnings like `Call to unknown function` or `Undefined property` on model attributes (e.g. in `where('tenant_id', ...)` or `$cart->customer`). 

Follow these steps to clean up the workspace diagnostics and enable autocompletion:

---

## 1) VS Code Workspace Settings
Make sure your workspace settings are configured to ignore false-positive diagnostics for dynamic properties/methods. Add the following to your `.vscode/settings.json` file (both in the project root and `backend/` directories):

```json
{
  "intelephense.diagnostics.undefinedFunctions": false,
  "intelephense.diagnostics.undefinedMethods": false,
  "intelephense.diagnostics.undefinedTypes": false,
  "intelephense.diagnostics.undefinedProperties": false,
  "intelephense.diagnostics.undefinedClassConstants": false,
  "intelephense.diagnostics.undefinedConstants": false,
  "php.problems.exclude": {
    "PHP0415": true,
    "PHP0416": true,
    "PHP0417": true,
    "PHP0418": true
  }
}
```

---

## 2) EditorConfig Rules (for PHP Tools / DEVSENSE)
If you are using the **DEVSENSE PHP Tools** extension, it integrates directly with `.editorconfig`. Add this rule block to the bottom of your `.editorconfig` file:

```ini
[*.php]
php_diagnostic_php0415 = false
php_diagnostic_php0416 = false
php_diagnostic_php0417 = false
php_diagnostic_php0418 = false
```

---

## 3) Generating Laravel Helper Files (Autocomplete)
To prevent model files from being cluttered with auto-generated docblock comments, keep the model files clean and generate definitions in a separate helper file:

Run the following commands in the `backend/` directory:

```bash
# 1. Generate core helper file
php artisan ide-helper:generate

# 2. Generate models helper file without writing comments directly to model classes
php artisan ide-helper:models --nowrite

# 3. Generate phpstorm meta file (optional, but good for container autocomplete)
php artisan ide-helper:meta
```

This will create the following files in the backend root directory (already added to `.gitignore`):
* `_ide_helper.php`
* `_ide_helper_models.php`
* `.phpstorm.meta.php`

Your editor will read these files to provide full autocompletion and type-hinting, while your model files remain completely clean of generated annotations.
