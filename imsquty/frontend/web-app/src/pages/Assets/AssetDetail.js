import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowBack, Save } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Grid, Paper, Typography, } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ControlledFormSelect, FormField, FormGroup } from '../../components/FormField';
import { useAssetForm, useAssetFormSubmit } from '../../hooks/useAssetForm';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAsset, updateAsset } from '../../store/slices/assetSlice';
import { fetchActiveDivisions } from '../../store/slices/divisionSlice';
import { fetchActiveLocations } from '../../store/slices/locationSlice';
import { fetchActiveManufacturers } from '../../store/slices/manufacturerSlice';
import { fetchActiveWarrantyTypes } from '../../store/slices/warrantyTypeSlice';
const AssetDetail = () => {
    const { id } = useParams();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { currentAsset, loading, error: assetError } = useAppSelector((state) => state.asset);
    const { divisions } = useAppSelector((state) => state.division);
    const { locations } = useAppSelector((state) => state.location);
    const { manufacturers } = useAppSelector((state) => state.manufacturer);
    const { warrantyTypes } = useAppSelector((state) => state.warrantyType);
    const { register, handleSubmit, errors, isSubmitting, control, setValue } = useAssetForm();
    const submitHandler = useAssetFormSubmit(async (data) => {
        try {
            if (!id)
                throw new Error('Asset ID not found');
            const result = await dispatch(updateAsset({
                id: parseInt(id),
                data: {
                    ...data,
                    asset_type_id: Number(data.asset_type_id),
                    division_id: Number(data.division_id),
                    location_id: Number(data.location_id),
                    manufacturer_id: Number(data.manufacturer_id),
                    warranty_type_id: Number(data.warranty_type_id),
                    cost: Number(data.cost),
                },
            }));
            if (result.payload) {
                navigate('/assets');
            }
        }
        catch (err) {
            console.error('Failed to update asset:', err);
        }
    });
    // Load asset and master data on mount
    useEffect(() => {
        if (id) {
            dispatch(fetchAsset(parseInt(id)));
            dispatch(fetchActiveDivisions());
            dispatch(fetchActiveLocations());
            dispatch(fetchActiveManufacturers());
            dispatch(fetchActiveWarrantyTypes());
        }
    }, [id, dispatch]);
    // Pre-populate form with current asset data
    useEffect(() => {
        if (currentAsset) {
            setValue('asset_tag', currentAsset.asset_tag);
            setValue('name', currentAsset.name);
            setValue('serial_number', currentAsset.serial_number);
            setValue('asset_type_id', currentAsset.asset_type_id);
            setValue('division_id', currentAsset.division_id);
            setValue('location_id', currentAsset.location_id);
            setValue('manufacturer_id', currentAsset.manufacturer_id);
            setValue('warranty_type_id', currentAsset.warranty_type_id);
            setValue('purchase_date', currentAsset.purchase_date);
            setValue('warranty_expiry_date', currentAsset.warranty_expiry_date);
            setValue('cost', currentAsset.cost);
            setValue('status', currentAsset.status);
            setValue('notes', currentAsset.notes);
        }
    }, [currentAsset, setValue]);
    const onSubmit = async (data) => {
        await submitHandler(data);
    };
    if (loading)
        return _jsx(CircularProgress, {});
    if (assetError)
        return _jsx(Alert, { severity: "error", children: assetError });
    if (!currentAsset)
        return _jsx(Alert, { severity: "warning", children: "Asset not found" });
    return (_jsxs(Box, { sx: { p: 3 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', mb: 3 }, children: [_jsx(Button, { startIcon: _jsx(ArrowBack, {}), onClick: () => navigate('/assets'), sx: { mr: 2 }, children: "Back" }), _jsxs(Typography, { variant: "h4", children: ["Asset Details: ", currentAsset?.asset_tag] })] }), assetError && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: assetError })), _jsx(Paper, { sx: { p: 3 }, children: _jsx("form", { onSubmit: handleSubmit(onSubmit), children: _jsxs(FormGroup, { spacing: 2.5, children: [_jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Basic Information" }), _jsx(FormField, { label: "Asset Tag", placeholder: "e.g., AST-001", error: errors.asset_tag, required: true, ...register('asset_tag') }), _jsx(FormField, { label: "Asset Name", placeholder: "e.g., Dell Laptop", error: errors.name, required: true, ...register('name') }), _jsx(FormField, { label: "Serial Number", placeholder: "e.g., SN123456789", error: errors.serial_number, required: true, ...register('serial_number') }), _jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Asset Details" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(ControlledFormSelect, { control: control, name: "division_id", label: "Division", options: divisions.map((d) => ({ label: d.name, value: d.id })), error: errors.division_id, required: true }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(ControlledFormSelect, { control: control, name: "location_id", label: "Location", options: locations.map((l) => ({ label: l.name, value: l.id })), error: errors.location_id, required: true }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(ControlledFormSelect, { control: control, name: "manufacturer_id", label: "Manufacturer", options: manufacturers.map((m) => ({
                                                label: m.name,
                                                value: m.id,
                                            })), error: errors.manufacturer_id, required: true }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(ControlledFormSelect, { control: control, name: "warranty_type_id", label: "Warranty Type", options: warrantyTypes.map((w) => ({
                                                label: w.name,
                                                value: w.id,
                                            })), error: errors.warranty_type_id, required: true }) })] }), _jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Purchase Information" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Purchase Date", type: "date", InputLabelProps: { shrink: true }, error: errors.purchase_date, required: true, ...register('purchase_date') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Warranty Expiry Date", type: "date", InputLabelProps: { shrink: true }, error: errors.warranty_expiry_date, required: true, ...register('warranty_expiry_date') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(FormField, { label: "Cost", type: "number", inputProps: { step: '0.01', min: '0' }, error: errors.cost, required: true, ...register('cost') }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsx(ControlledFormSelect, { control: control, name: "status", label: "Status", options: [
                                                { label: 'Active', value: 'active' },
                                                { label: 'Inactive', value: 'inactive' },
                                                { label: 'Maintenance', value: 'maintenance' },
                                                { label: 'Retired', value: 'retired' },
                                            ], error: errors.status, required: true }) })] }), _jsx(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: "Additional Information" }), _jsx(FormField, { label: "Notes", multiline: true, rows: 4, placeholder: "Enter any additional notes about this asset...", error: errors.notes, ...register('notes') }), _jsxs(Box, { sx: { display: 'flex', gap: 2, mt: 3 }, children: [_jsx(Button, { variant: "contained", color: "primary", type: "submit", startIcon: isSubmitting ? (_jsx(CircularProgress, { size: 20 })) : (_jsx(Save, {})), disabled: isSubmitting || loading, children: isSubmitting || loading ? 'Saving...' : 'Save Changes' }), _jsx(Button, { variant: "outlined", color: "secondary", onClick: () => navigate('/assets'), disabled: isSubmitting || loading, children: "Cancel" })] })] }) }) })] }));
};
export default AssetDetail;
