import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongoose';
import Favorite from '../../../models/Favorite';

// GET - Obtener favoritos del usuario
export async function GET(request: NextRequest){
    try{
        await connectDB(); // <-- Establece la conexión a la base de datos
        
        // Obtener el userId de los parámetros de la URL
        const {searchParams} = new URL(request.url);
        const userId = searchParams.get('userId');

        // Validar que userId sea requerido
        if(!userId){
            return NextResponse.json({
                error: 'userId es requerido'
            }, {
                status: 400
            });
        }

        const favorites = await Favorite.find({userId}).
        sort({createdAt: -1}).lean(); // <-- Busca los favoritos del usuario y los ordena por fecha de creación

        return NextResponse.json(favorites);
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        return NextResponse.json({
            error: 'Error del servidor'
        }, {
            status: 500
        });
    }
}

// POST - Agregar un libro a favoritos
export async function POST(request: NextRequest){
    try {
        await connectDB(); // <-- Establece la conexión a la base de datos

        const body = await request.json();
        const {userId, bookId, action} = body;

        if(!userId || !bookId || !action){
            return NextResponse.json({
                error: 'Todos los campos son requeridos'
            }, {
                status: 400
            });
        }

        if(action !== 'add' && action !== 'remove'){
            return NextResponse.json({
                error: 'action debe ser add o remove'
            }, {
                status: 400
            });
        }

        if(action === 'add'){
            //verifico si el libro ya esta en favoritos
            const existingFavorite = await Favorite.findOne({userId, bookId});
            if(existingFavorite){
                return NextResponse.json({
                    error: 'El libro ya esta en favoritos'
                }, {
                    status: 400
                });
            }

            //si no esta, lo agrego
            const newFavorite = await Favorite.create({userId, bookId});
            return NextResponse.json(newFavorite, {status: 201});
        } else if(action === 'remove'){
            //verifico si el libro esta en favoritos
            const existingFavorite = await Favorite.findOne({userId, bookId});
            if(!existingFavorite){
                return NextResponse.json({
                    error: 'El libro no esta en favoritos'
                }, {
                    status: 400
                });
            }

            //si esta, lo elimino
            await Favorite.findByIdAndDelete(existingFavorite._id);
            return NextResponse.json({
                message: 'Libro eliminado de favoritos'
            }, {
                status: 200
            });

        }
    } catch(error){
        console.error('Error al agregar o eliminar libro de favoritos:', error);
        return NextResponse.json({
            error: 'Error del servidor'
        }, {
            status: 500
        });
    }
    }