import React, { useEffect, useState, useCallback } from "react";
import { 
    View, 
    Text, 
    FlatList, 
    Button, 
    Platform, 
    ActivityIndicator, 
    StyleSheet 
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { HeaderButtons, Item } from "react-navigation-header-buttons";

import HeaderButton from '../../componets/UI/HeaderButton';
import ProductItem from "../../componets/shop/ProductItem";
import * as cartActions from '../../store/actions/cart';
import * as productsActions from '../../store/actions/products';
import Colors from "../../constants/Colors";

const ProductOverViewScreen = props => {
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();
    const products = useSelector(state => state.products.availableProducts);
    const dispatch = useDispatch();

    const loadedProducts = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(productsActions.fetchProducts());
        }   catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError]);
    
    useEffect(() => {
        const willFocusSub = props.navigation.addListener(
            'willFocusSub', 
            loadedProducts
        );

        return () => {
            willFocusSub.remove();
        };
    }, [loadedProducts]);

    useEffect(() => {
        setIsLoading(true);
        loadedProducts().then(() => {
            setIsLoading(false);
        }); 
    }, [dispatch, loadedProducts]);

    const selectItemHandler = (id, title) => {
        props.navigation.navigate( 'ProductDetail', { 
            productId: id,
            productTitle: title
        });
    };

    if (error) {
        return (
            <View style={styles.centered}>
                <Text>An error occured!</Text>
                <Button 
                    title="Try again" 
                    onPress={loadedProducts}
                    color={Colors.primary}    
                />
            </View>
        );
    }
 
    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size='large' color={Colors.primary} />
            </View>
        );
    }

    if (!isLoading && products.length === 0) {
        return (
            <View style={styles.centered}>
                <Text>
                    No products found. Maybe start adding some!
                </Text>  
            </View>
        );
    }
    
    return (
        <FlatList 
            onRefresh={loadedProducts}
            refreshing={isRefreshing}
            data={products} 
            keyExtractor={item => item.id} 
            renderItem={itemData => 
                <ProductItem 
                    image={itemData.item.imageUrl}
                    title={itemData.item.title}
                    price={itemData.item.price}
                    onSelect={() => {
                        selectItemHandler(itemData.item.id, itemData.item.title);
                    }}
                >
                    <Button 
                        color={Colors.primary} 
                        title="View Details" 
                        onPress={() => {
                            selectItemHandler(itemData.item.id, itemData.item.title);
                        }} 
                    />
                    <Button 
                        color={Colors.primary}
                        title="To Cart" 
                        onPress={() => {
                            dispatch(cartActions.addToCart(itemData.item));
                        }}
                    />
                </ProductItem>
            }
        />
    );
};

ProductOverViewScreen.navigationOptions = navData => {
   return {
    headerTitle: 'All Products',
    headerLeft: () => 
        <HeaderButtons HeaderButtonComponent={HeaderButton}> 
            <Item 
                title="Menu"
                iconName={Platform.OS === 'android' ? 'md-menu' : 'ios-menu'}
                onPress={() => {
                    navData.navigation.toggleDrawer();
                }}
            />
        </HeaderButtons>,
    headerRight: () => 
        <HeaderButtons HeaderButtonComponent={HeaderButton}>
            <Item 
                title="Cart"
                iconName={Platform.OS === 'android' ? 'md-cart' : 'ios-cart'}
                onPress={() => {
                    navData.navigation.navigate('Cart')
                }}
            />
        </HeaderButtons>
   };
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default ProductOverViewScreen;   