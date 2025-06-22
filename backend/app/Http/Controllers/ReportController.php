<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    /**
     * Enregistre un nouveau rapport
     */
public function store(Request $request)
{
    // Log complet de la requête entrante
    Log::channel('reports')->debug('Requête reçue', [
        'headers' => $request->headers->all(),
        'payload' => $request->all(),
        'user' => Auth::id(),
        'ip' => $request->ip()
    ]);

    try {
        // Validation avec messages personnalisés
        $validated = $request->validate([
            'data' => 'required|array',
            'type' => 'required|string|max:255',
        ], [
            'data.array' => 'Le champ data doit être un tableau valide',
            'type.max' => 'Le type ne doit pas dépasser 255 caractères'
        ]);

        // Conversion explicite des données
        $dataToSave = $validated['data'];
        if (is_string($dataToSave)) {
            $dataToSave = json_decode($dataToSave, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Format JSON invalide dans data: " . json_last_error_msg());
            }
        }

$report = Report::create([
    'user_id' => Auth::id(), // renverra null si pas connecté
    'data' => json_encode($dataToSave),
    'type' => $validated['type'],
]);

        return response()->json([
            'success' => true,
            'report_id' => $report->id,
            'data_size' => count($dataToSave),
            'db_response' => $report->toArray() // Pour debug
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        // Erreurs de validation spécifiques
        $errors = $e->validator->errors()->all();
        Log::channel('reports')->error('Erreur validation', [
            'errors' => $errors,
            'input' => $request->all()
        ]);
        
        return response()->json([
            'success' => false,
            'error_type' => 'validation',
            'errors' => $errors,
            'received_data' => $request->all()
        ], 422);

    } catch (\Exception $e) {
        // Erreur générale avec stack trace
        Log::channel('reports')->error('Erreur création rapport', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'payload' => $request->all()
        ]);
        
        return response()->json([
            'success' => false,
            'error_type' => 'server',
            'error_message' => $e->getMessage(),
            'error_details' => env('APP_DEBUG') ? $e->getTraceAsString() : null,
            'request_debug' => [
                'data_type' => gettype($request->input('data')),
                'data_sample' => is_array($request->input('data')) 
                    ? array_slice($request->input('data'), 0, 3) 
                    : substr($request->input('data'), 0, 100)
            ]
        ], 500);
    }
}

    /**
     * Liste les rapports de l'utilisateur
     */
    public function index()
    {
        // Version de base
        $reports = Auth::user()->reports()
                      ->orderBy('created_at', 'desc')
                      ->get();

        // Version avec pagination (optionnelle)
        // $reports = Auth::user()->reports()
        //               ->orderBy('created_at', 'desc')
        //               ->paginate(10);

        return response()->json([
            'success' => true,
            'reports' => $reports
        ]);
    }

    /**
     * Récupère un rapport spécifique
     */
    public function show(Report $report)
    {
        // Vérifie que l'utilisateur peut accéder à ce rapport
        if ($report->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'report' => $report
        ]);
    }
}