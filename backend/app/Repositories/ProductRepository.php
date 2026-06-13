<?php

namespace App\Repositories;

use App\Models\Products;

class ProductRepository
{
    public function all()
    {
        return Products::all();
    }

    public function find(int $id): Products
    {
        return Products::findOrFail($id);
    }

    public function create(array $data): Products
    {
        return Products::create($data);
    }

    public function update(Products $product, array $data): Products
    {
        $product->update($data);
        return $product;
    }

    public function delete(Products $product): bool
    {
        return $product->delete();
    }
}
