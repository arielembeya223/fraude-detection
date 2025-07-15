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
        try {
            $reports = Report::orderBy('created_at', 'desc')
                ->get()
                ->map(function ($report) {
                    return [
                        'id' => $report->id,
                        'type' => $report->type,
                        'title' => 'Rapport ' . $report->type,
                        'date' => $report->created_at->format('d/m/Y'),
                        'time' => $report->created_at->format('H:i'),
                        'created_at' => $report->created_at->toDateTimeString(),
                        'data_summary' => $this->summarizeData($report->data) // Fonction helper
                    ];
                });

            return response()->json([
                'success' => true,
                'reports' => $reports,
                'count' => $reports->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching reports: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des rapports',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Récupère un rapport spécifique
     */
 private function summarizeData($data)
    {
        if (!is_array($data)) {
            $data = json_decode($data, true) ?? [];
        }

        return [
            'items_count' => count($data),
            'first_items' => array_slice($data, 0, 3)
        ];
    }

    /**
     * Affiche un rapport spécifique (sans auth)
     */
    public function show($id)
    {
        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Rapport non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'report' => [
                'id' => $report->id,
                'type' => $report->type,
                'full_data' => $report->data,
                'created_at' => $report->created_at->format('d/m/Y H:i:s')
            ]
        ]);
    }
}