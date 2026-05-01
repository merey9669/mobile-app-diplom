import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Modal,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, COLORS } from '../components/UI';
import { Product, UserRole } from '../types';
import { showToast } from '../utils/toast';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 карточки в ряд с отступами

const getBonusPrice = (product: Product) => {
  if (product.price) return product.price;

  const name = product.name.toLowerCase();
  if (name.includes('термокруж')) return '1000 бонусных баллов';
  if (name.includes('планер')) return '700 бонусных баллов';
  if (name.includes('худи')) return '2500 бонусных баллов';
  if (name.includes('рюкзак')) return '3200 бонусных баллов';
  if (name.includes('лидер')) return '2200 бонусных баллов';
  if (name.includes('продаж')) return '1800 бонусных баллов';

  return '1000 бонусных баллов';
};

interface CatalogScreenProps {
  products: Product[];
  role: UserRole;
  onAddProduct?: (product: Omit<Product, 'id'>) => void;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({ products, role, onAddProduct }) => {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image: '',
    features: [] as string[]
  });
  const [featureInput, setFeatureInput] = useState('');

  // Получаем уникальные категории
  const categories = ['Все', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setNewProduct(prev => ({
        ...prev,
        features: [...prev.features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.description || !newProduct.price) {
      showToast.error('Ошибка', 'Заполните все обязательные поля');
      return;
    }

    // Проверка валидности URL только если он введен
    if (newProduct.image) {
      try {
        new URL(newProduct.image);
      } catch {
        showToast.error('Ошибка', 'Введите корректный URL изображения');
        return;
      }
    }

    onAddProduct?.({
      ...newProduct,
      image: newProduct.image || 'https://via.placeholder.com/400x300?text=No+Image'
    });

    showToast.success('Успешно', 'Бонус добавлен');
    setNewProduct({
      name: '',
      category: '',
      price: '',
      description: '',
      image: '',
      features: []
    });
    setShowAddModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Шапка с поиском */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск бонусов..."
            placeholderTextColor={COLORS.gray[400]}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Категории - горизонтальный скролл */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Список бонусов */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="basket-outline" size={64} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>
                {search ? 'Ничего не найдено' : 'Бонусная витрина пуста'}
            </Text>
            <Text style={styles.emptyDesc}>
              {search
                ? 'Попробуйте изменить поисковый запрос'
                : role === 'MANAGER'
                ? 'Добавьте первый бонус для мотивации сотрудников'
                : 'Пока нет бонусов для отображения'
              }
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => setSelectedProduct(product)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productPrice}>{getBonusPrice(product)}</Text>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productDesc} numberOfLines={2}>
                    {product.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Информационная секция для сотрудников */}
        {role === 'EMPLOYEE' && products.length > 0 && (
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={COLORS.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Бонусная система</Text>
                <Text style={styles.infoDesc}>
                  Здесь сотрудники видят поощрения, которые можно связать с рейтингом и бонусными баллами.
                  Нажмите на карточку для подробной информации.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Кнопка добавления для менеджеров */}
      {role === 'MANAGER' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={COLORS.surface} />
        </TouchableOpacity>
      )}

      {/* Модальное окно детального просмотра */}
      {selectedProduct && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setSelectedProduct(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Детали бонуса</Text>
              <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                <Ionicons name="close" size={28} color={COLORS.gray[700]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: selectedProduct.image }}
                style={styles.detailImage}
                resizeMode="cover"
              />

              <View style={styles.detailContent}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{selectedProduct.category}</Text>
                </View>

                <Text style={styles.detailName}>{selectedProduct.name}</Text>
                <View style={styles.detailPriceBadge}>
                  <Ionicons name="sparkles-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.detailPriceText}>{getBonusPrice(selectedProduct)}</Text>
                </View>
                <Text style={styles.detailDesc}>{selectedProduct.description}</Text>

                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <View style={styles.featuresSection}>
                    <Text style={styles.featuresTitle}>Характеристики:</Text>
                    {selectedProduct.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.detailFooter}>
                  <Ionicons name="information-circle-outline" size={16} color={COLORS.gray[400]} />
                  <Text style={styles.detailFooterText}>
                    За подробной информацией обращайтесь к вашему менеджеру
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* Модальное окно добавления бонуса */}
      {showAddModal && (
        <Modal
          visible={true}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowAddModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
            keyboardVerticalOffset={0}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Добавить бонус</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.gray[700]} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.form}>
                {/* Название */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Название бонуса *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Введите название"
                    placeholderTextColor={COLORS.gray[400]}
                    value={newProduct.name}
                    onChangeText={(text) => setNewProduct(prev => ({ ...prev, name: text }))}
                  />
                </View>

                {/* Категория */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Категория *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Например: Электроника"
                    placeholderTextColor={COLORS.gray[400]}
                    value={newProduct.category}
                    onChangeText={(text) => setNewProduct(prev => ({ ...prev, category: text }))}
                  />
                  {categories.length > 1 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.suggestedCategories}
                    >
                      <Text style={styles.suggestedLabel}>Существующие: </Text>
                      {categories.filter(c => c !== 'Все').map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={styles.suggestedChip}
                          onPress={() => setNewProduct(prev => ({ ...prev, category: cat }))}
                        >
                          <Text style={styles.suggestedChipText}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Бонусная цена *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Например: 1000 бонусных баллов"
                    placeholderTextColor={COLORS.gray[400]}
                    value={newProduct.price}
                    onChangeText={(text) => setNewProduct(prev => ({ ...prev, price: text }))}
                  />
                </View>

                {/* Описание */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Описание *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Подробное описание бонуса"
                    placeholderTextColor={COLORS.gray[400]}
                    value={newProduct.description}
                    onChangeText={(text) => setNewProduct(prev => ({ ...prev, description: text }))}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* URL изображения */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>URL изображения (опционально)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://example.com/image.jpg"
                    placeholderTextColor={COLORS.gray[400]}
                    value={newProduct.image}
                    onChangeText={(text) => setNewProduct(prev => ({ ...prev, image: text }))}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                  {newProduct.image && (
                    <Image
                      source={{ uri: newProduct.image }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                  )}
                </View>

                {/* Характеристики */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Характеристики (опционально)</Text>
                  <View style={styles.featureInputContainer}>
                    <TextInput
                      style={[styles.input, styles.featureInput]}
                      placeholder="Добавить характеристику"
                      placeholderTextColor={COLORS.gray[400]}
                      value={featureInput}
                      onChangeText={setFeatureInput}
                      onSubmitEditing={handleAddFeature}
                    />
                    <TouchableOpacity
                      style={styles.addFeatureButton}
                      onPress={handleAddFeature}
                    >
                      <Ionicons name="add-circle" size={32} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>

                  {newProduct.features.length > 0 && (
                    <View style={styles.featuresList}>
                      {newProduct.features.map((feature, index) => (
                        <View key={index} style={styles.featureTag}>
                          <Text style={styles.featureTagText}>{feature}</Text>
                          <TouchableOpacity onPress={() => handleRemoveFeature(index)}>
                            <Ionicons name="close-circle" size={20} color={COLORS.gray[500]} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Кнопка добавления */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddProduct}
                >
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.surface} />
                  <Text style={styles.submitButtonText}>Добавить бонус</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  categoriesScroll: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  categoryTextActive: {
    color: COLORS.surface,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.gray[100],
  },
  productInfo: {
    padding: 12,
  },
  productCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productPrice: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.green[700],
    backgroundColor: COLORS.green[50],
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray[800],
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 12,
    color: COLORS.gray[500],
    lineHeight: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[700],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  infoSection: {
    marginTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: COLORS.gray[600],
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 130,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray[800],
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  detailImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.gray[100],
  },
  detailContent: {
    padding: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  detailName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray[800],
    marginBottom: 12,
  },
  detailPriceBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  detailPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  detailDesc: {
    fontSize: 16,
    color: COLORS.gray[600],
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray[800],
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.gray[700],
    marginLeft: 12,
    flex: 1,
  },
  detailFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  detailFooterText: {
    fontSize: 13,
    color: COLORS.gray[600],
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  form: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  suggestedCategories: {
    marginTop: 8,
    maxHeight: 40,
  },
  suggestedLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    alignSelf: 'center',
    marginRight: 8,
  },
  suggestedChip: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  suggestedChipText: {
    fontSize: 12,
    color: COLORS.gray[600],
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: COLORS.gray[100],
  },
  featureInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureInput: {
    flex: 1,
  },
  addFeatureButton: {
    padding: 4,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  featureTagText: {
    fontSize: 14,
    color: COLORS.gray[700],
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 8,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
